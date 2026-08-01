## Context

Atualmente o domínio possui `BandEntity` e `BandMemberEntity`, com `IBandRepository` expondo apenas `saveWithOwner` e `IBandMemberRepository` expondo apenas `save`. Não existe nenhum método para verificar existência de uma banda por `id`, nem para verificar se um usuário é membro de uma banda — ambos necessários para este cadastro. O padrão de autenticação já estabelecido (`JwtAuthGuard`, `request.user.id`) e o padrão de verificação de "usuário autenticado ainda existe" (usado em `CreateBandUseCase`) serão reaproveitados.

## Goals / Non-Goals

**Goals:**
- Permitir o cadastro de músicas do repertório vinculadas a uma banda via `POST /bands/:id/song`
- Garantir que somente membros da banda possam cadastrar músicas nela
- Reutilizar os padrões arquiteturais já existentes (entidade de domínio, interface de repositório, use case, DTO, controller, factory module, migration)

**Non-Goals:**
- Listagem, edição ou remoção de músicas do repertório (fora do escopo desta mudança)
- Ordenação, categorização ou tags do repertório
- Upload de arquivos de áudio ou partituras

## Decisions

### Nome da tabela e rota
A tabela será `band_songs` e o endpoint `POST /bands/:id/song`, seguindo o padrão de plural já estabelecido em `/bands`.

### Estrutura de campos
`title` é o único campo obrigatório (string, mínimo 1 caractere). Os campos `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` são todos opcionais (nullable no banco). `bpm` e `duration` são armazenados como `integer`; `lyrics` como `text` (pode ser longa); os demais como `varchar`.

### Extensão de `IBandRepository`
Será adicionado o método `findById(id: string): Promise<BandEntity | null>` para permitir a verificação de existência da banda antes de validar o vínculo do usuário. Alternativa descartada: repetir a query diretamente via `DataSource` — rejeitada por violar o Repository Pattern.

### Extensão de `IBandMemberRepository`
Será adicionado o método `existsByBandAndUser(bandId: string, userId: string): Promise<boolean>` para verificar o vínculo de membership. Alternativa descartada: carregar o `BandMemberEntity` completo (`findByBandAndUser`) — rejeitada por ser desnecessário (Object Calisthenics / YAGNI).

### Autorização via guard (`AuthUserIsMemberBandGuard`)
As checagens de existência da banda, existência do usuário autenticado e vínculo de membership são responsabilidade de um guard HTTP (`AuthUserIsMemberBandGuard`, em `src/http/middlewares/`), aplicado em conjunto com o `JwtAuthGuard` (`@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)`). Ordem de validação no guard:
1. Banda existe (`BandRepository.findById`) → 404 se não
2. Usuário autenticado existe (`UserRepository.findBy`) → 404 se não
3. Usuário é membro da banda (`BandMemberRepository.existsByBandAndUser`) → 403 se não

Essa ordem evita vazar informação sobre membership de usuários inexistentes e prioriza o recurso da URL (banda) antes de validar o ator. Com a autorização resolvida no guard, `CreateBandSongUseCase` fica responsável apenas por montar e persistir a `BandSongEntity` (depende somente de `IBandSongRepository`). Alternativa descartada: manter as três checagens dentro do use case — rejeitada após revisão, pois autorização é uma preocupação da camada HTTP e o guard é reutilizável por futuras rotas aninhadas em `/bands/:id/*`.

**Nota de wiring (NestJS):** `AuthUserIsMemberBandGuard` e suas dependências (`BandRepository`, `UserRepository`, `BandMemberRepository`, `TypeOrmModule.forFeature` das entidades correspondentes) são providers do próprio `HttpModule`, não da `BandSongFactoryModule`. O NestJS resolve classes passadas em `@UseGuards()` usando o injector do módulo onde o *controller* está declarado — registrá-las apenas dentro de uma factory module importada gera `UnknownDependenciesException` em tempo de bootstrap, mesmo que a factory module exporte o guard.

### Nova entidade e repositório
`BandSongEntity` (domínio) segue o mesmo padrão de `BandEntity`/`BandMemberEntity` (classe imutável, `readonly` fields). `IBandSongRepository` expõe apenas `save(bandSong: BandSongEntity): Promise<void>`, seguindo o princípio de interface segregada (sem métodos não utilizados por este fluxo).

## Risks / Trade-offs

- [Checagem de existência do usuário duplica lógica já presente em `CreateBandUseCase`] → Aceitável no momento (sem abstração prematura); se um terceiro caso de uso precisar da mesma checagem, extrair um serviço de domínio compartilhado.
- [`bpm` e `duration` como `integer` sem casas decimais] → Aceito pois BPM e duração em segundos não requerem precisão fracionária neste contexto.

## Migration Plan

- Nova migration `create-band-songs-table` cria a tabela `band_songs` com FK `band_id → bands.id` (`ON DELETE CASCADE`) e índice em `band_id`.
- Sem impacto em dados existentes; migration é aditiva e reversível via `down()` (`dropTable`).
