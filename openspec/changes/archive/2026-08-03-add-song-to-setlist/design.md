## Context

O setlist de uma banda (`band_setlists`) e o repertório da banda (`band_songs`) já existem como capabilities independentes, sem nenhuma ligação entre si. Este é o primeiro recurso do domínio que amarra os dois — e também a primeira rota da API com dois parâmetros de banda/recurso pai encadeados (`bands/:id/setlists/:setlistId/songs`), o que exige decisões explícitas sobre nomeação de parâmetros e reuso de guards existentes.

Ambos os designs anteriores (`add-band-setlists`, `list-band-setlists`) já reservavam o nome de tabela `band_setlist_songs` e a coluna `position` para esta funcionalidade futura — este design apenas materializa essa previsão.

## Goals / Non-Goals

**Goals:**
- Permitir associar uma música do repertório (`band_songs`) a um setlist (`band_setlists`) através de `POST /bands/:id/setlists/:setlistId/songs`.
- Reaproveitar o mesmo encadeamento de validações (banda existe → usuário existe → usuário é membro) já usado em `band-setlists` e `band-repertoire`, estendido com a validação de setlist e de música.
- Seguir a mesma arquitetura em camadas (domain/application/infrastructure/http) e o mesmo padrão de factory module + DI por token.

**Non-Goals:**
- Reordenação de músicas em um setlist já existente (endpoint de update de `position`) — proposta futura.
- Remoção de música de um setlist (`DELETE`) — proposta futura.
- Rejeitar duplicidade de `bandSongId` no mesmo setlist — decisão explícita do usuário: a mesma música pode ser adicionada mais de uma vez (ex.: bis).
- Listagem de músicas de um setlist (`GET .../songs`) — proposta futura; este change cobre apenas o cadastro.

## Decisions

### Nomenclatura do campo de música: `bandSongId`
A tabela e a entidade reais no código chamam-se `band_songs` / `BandSongEntity`, apesar de a capability OpenSpec ser `band-repertoire`. Para manter consistência com os identificadores existentes no código (e evitar um nome de campo público que não corresponde a nenhuma entidade real), o campo no corpo da requisição é `bandSongId`, não `bandRepertoireId`.
**Alternativa considerada:** `songId` — mais curto, mas menos explícito sobre a relação de posse com a banda.

### Novo controller dedicado, mas sem pasta própria: `BandSetlistSongController`
Diferente do `GET /bands/:id/setlists`, que foi adicionado ao `BandSetlistController` existente por ser rota irmã direta do mesmo recurso, este endpoint introduz um recurso novo (a associação música-setlist, com sua própria entidade/tabela/DTO) — por isso continua sendo uma classe de controller separada, com seu próprio decorator Swagger.
**Alternativa considerada:** adicionar o handler ao `BandSetlistController`. Rejeitada por misturar duas responsabilidades (setlist em si vs. músicas do setlist) no mesmo controller, o que dificultaria a evolução futura (listagem, remoção, reordenação de músicas do setlist).

### Consolidação de pastas: tudo dentro de `band/`
Ao contrário do desenho inicial (que previa diretórios isolados `band-setlist/` e `band-song/`), todo o conteúdo relativo a banda, setlist e repertório de músicas — em todas as camadas (`domain/entities`, `domain/repositories`, `infrastructure/entities`, `infrastructure/repository`, `application/usecase` incluindo o barrel `interfaces/index.ts`, `shared/communication/dtos` e `http`) — foi consolidado dentro de uma única pasta `band/` por camada, em vez de três pastas paralelas (`band/`, `band-setlist/`, `band-song/`) quase idênticas em estrutura. Os nomes de arquivo/classe (`BandSetlistEntity`, `BandSongEntity`, `BandSetlistSongEntity`, `BandSetlistController`, `BandSongController`, `BandSetlistSongController`, etc.) permanecem os mesmos; apenas a localização física muda.

Os três factory modules HTTP (`BandFactoryModule`, `BandSetlistFactoryModule`, `BandSongFactoryModule`) foram unificados em um único `BandFactoryModule`, em `src/http/band/band-factory.module.ts`, que agora expõe todos os sete tokens (`CREATE_BAND_USE_CASE`, `LIST_BANDS_BY_USER_USE_CASE`, `CREATE_BAND_SETLIST_USE_CASE`, `LIST_BAND_SETLISTS_USE_CASE`, `ADD_SONG_TO_SETLIST_USE_CASE`, `CREATE_BAND_SONG_USE_CASE`, `LIST_BAND_SONGS_USE_CASE`), registra todas as entidades TypeORM e repositórios relacionados via um único `TypeOrmModule.forFeature([...])` e um único `forRoot()`.
**Motivo:** banda, setlist e repertório de músicas são o mesmo contexto de domínio (a banda é o agregado raiz de que os outros dois dependem); manter três pastas e três factory modules quase idênticos por camada era fragmentação desnecessária.
**Alternativa considerada:** manter pastas e factory modules separados por sub-recurso (padrão anterior). Rejeitada por decisão explícita do usuário, que priorizou uma única pasta/módulo por contexto em vez de granularidade por endpoint.

Pelo mesmo motivo, `band-member` (membro da banda, entidade auxiliar usada por `AuthUserIsMemberBandGuard` e pelo cadastro de banda) também foi consolidado dentro de `band/` em `domain/entities`, `domain/repositories`, `infrastructure/entities` e `infrastructure/repository` — não existiam camadas `application/usecase`, `dtos` ou `http` próprias para `band-member`, então só essas quatro camadas foram afetadas. `BandMemberRepository` continua sendo registrado como provider tanto no `BandFactoryModule` quanto diretamente no `HttpModule` (para uso pelo guard), sem mudança de comportamento — apenas de localização física do arquivo.

### Parâmetros de rota: `:id` (banda) + `:setlistId` (setlist)
`AuthUserIsMemberBandGuard` lê `request.params.id` de forma fixa para validar a banda — por isso o parâmetro de banda permanece literalmente `id`, como já decidido nos designs anteriores. O parâmetro de setlist recebe o nome explícito `setlistId` (não `id`), já que a rota agora tem dois identificadores e o guard não teria como diferenciá-los.

### Validação de setlist e música fora do guard
`AuthUserIsMemberBandGuard` continua responsável apenas por banda/usuário/membro (401/404/404/403). A validação de que `setlistId` existe e pertence à banda, e de que `bandSongId` existe e pertence à mesma banda, é feita dentro do `AddSongToSetlistUseCase`, retornando 404 em ambos os casos (mesmo padrão de "recurso não encontrado" já usado nas exceções de banda/usuário). Isso exige dois métodos novos, hoje inexistentes:
- `IBandSetlistRepository.findById(id): Promise<BandSetlistEntity | null>`
- `IBandSongRepository.findById(id): Promise<BandSongEntity | null>`
**Alternativa considerada:** criar um guard adicional (`SetlistBelongsToBandGuard`). Rejeitada porque a validação de `bandSongId` depende do corpo da requisição (não apenas de parâmetros de rota), quebrando o padrão atual de guards, que só inspecionam `params`/JWT.

### Ordem das validações
1. Banda (`:id`) existe → senão 404 (guard).
2. Usuário autenticado existe → senão 404 (guard).
3. Usuário é membro da banda → senão 403 (guard).
4. Setlist (`:setlistId`) existe e pertence à banda (`:id`) → senão 404 (use case).
5. Música (`bandSongId`) existe e pertence à banda (`:id`) → senão 404 (use case).
6. Resolver colisão de `position` (ver decisão abaixo) e persistir o vínculo.

### Duplicidade de `bandSongId` é permitida
Por decisão explícita do usuário, o sistema NÃO valida se a música já está no setlist. A mesma música pode aparecer mais de uma vez no mesmo setlist (ex.: bis).

### Reposicionamento automático em caso de colisão de `position`
Quando a `position` informada no corpo da requisição já está em uso por outro vínculo do **mesmo** `:setlistId`, o sistema IGNORA o valor informado e posiciona a nova música na última posição do setlist: `position = MAX(position)` entre os vínculos existentes desse `:setlistId`, `+ 1`. Se o setlist ainda não possui nenhuma música, não há colisão possível e a `position` informada é usada como enviada.
Isso exige que o `AddSongToSetlistUseCase` consulte os vínculos existentes do setlist antes de persistir — novo método `IBandSetlistSongRepository.findAllByBandSetlistId(bandSetlistId): Promise<BandSetlistSongEntity[]>`, no mesmo padrão de `findAllByBandId` já usado em `BandSetlistRepository`/`BandSongRepository`.
**Alternativa considerada:** rejeitar a requisição com 422 quando há colisão. Rejeitada por decisão explícita do usuário — o cliente não precisa acertar a posição exata na primeira tentativa; o sistema resolve o conflito automaticamente.
**Alternativa considerada:** usar a contagem de músicas do setlist (`COUNT + 1`) em vez de `MAX(position) + 1`. Rejeitada porque `position` pode ter lacunas (ex.: após uma remoção futura) e `COUNT + 1` poderia colidir novamente com uma `position` alta já existente.

### Resposta: 201 sem corpo
Segue o mesmo padrão de `POST /bands/:id/setlists` e `POST /bands/:id/songs` — sem envelope de resposta, apenas o status HTTP.

### Modelagem da tabela `band_setlist_songs`
Colunas: `id` (uuid PK, uuidv7), `band_setlist_id` (uuid, FK → `band_setlists.id`, `ON DELETE CASCADE`), `band_song_id` (uuid, FK → `band_songs.id`, `ON DELETE CASCADE`), `position` (integer), `created_at`/`updated_at` (timestamptz). Índice em `band_setlist_id` (padrão de índice em FK já usado nas migrations existentes).

## Risks / Trade-offs

- [Reposicionamento automático e silencioso pode surpreender o cliente da API, que não recebe aviso de que a `position` enviada foi ignorada] → Mitigação: resposta continua 201 sem corpo (padrão do projeto), mas o comportamento é documentado explicitamente na spec/Swagger; um futuro endpoint de listagem permitirá ao cliente conferir a `position` real atribuída.
- [Calcular `MAX(position) + 1` exige uma consulta adicional aos vínculos do setlist antes de persistir, a cada cadastro] → Mitigação: consulta simples e indexada por `band_setlist_id`; custo aceitável dado o volume esperado (setlists com dezenas de músicas, não milhares).
- [Permitir a mesma música duas vezes no setlist pode ser confundido com bug pelo consumidor da API] → Mitigação: documentar explicitamente no Swagger/spec que duplicatas são permitidas (uso legítimo: bis).
- [`ON DELETE CASCADE` em `band_song_id` remove silenciosamente entradas do setlist se a música for excluída do repertório] → Mitigação: comportamento consistente com o padrão já adotado nas demais FKs do projeto; não há endpoint de exclusão de música ainda, então o risco é apenas teórico nesta fase.

## Migration Plan

1. Criar migration `create-band-setlist-songs-table` com a tabela e índice descritos acima.
2. Implementar domínio → infraestrutura → repositório → caso de uso → DTO/Swagger → controller/factory module → wiring no `HttpModule`, cada camada com testes unitários (TDD, cobertura 100%).
3. Testes e2e cobrindo os cenários descritos em `specs/band-setlist-songs/spec.md`.
4. Rollback: `npm run migration:revert` remove a tabela; não há dado pré-existente a migrar (tabela nova).

## Open Questions

Nenhuma pendente — decisões de nomenclatura, duplicidade e colisão de `position` foram confirmadas com o usuário durante a proposta.
