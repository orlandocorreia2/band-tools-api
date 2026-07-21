## Context

Hoje `bands` e `users` não têm nenhum relacionamento. `POST /bands` (`BandController` → `CreateBandUseCase` → `IBandRepository`) apenas persiste a banda, sem registrar quem a criou. O `JwtAuthGuard` já popula `request.user = { id, email }` a partir do JWT, mas o `BandController` não usa essa informação hoje.

Este design cobre a criação da tabela pivô `band_members` (N:N entre `users` e `bands`, com o papel `is_owner`) e a alteração do fluxo de criação de banda para vincular automaticamente o criador como dono. É a primeira vez no projeto em que uma operação precisa gravar em duas tabelas de forma atômica.

## Goals / Non-Goals

**Goals:**
- Persistir o vínculo N:N entre `users` e `bands` através de `band_members`, com chave composta (`band_id`, `user_id`) e um índice adicional para buscas por `user_id`
- Garantir que, ao criar uma banda, o usuário autenticado seja gravado em `band_members` com `is_owner = true` na mesma transação da criação da banda
- Manter a camada de aplicação dependente apenas de interfaces de repositório, nunca do TypeORM diretamente

**Non-Goals:**
- Endpoints de gerenciamento de membros (adicionar, remover, listar, transferir posse) — ficam para uma proposta futura
- Regras de autorização baseadas em `is_owner` (ex.: apenas o dono pode editar/excluir a banda) — fora de escopo desta mudança
- Suporte a convite de membros não-donos — fora de escopo

## Decisions

### Chave primária composta, sem coluna `id` própria
`band_members` usa `PRIMARY KEY (band_id, user_id)` em vez de um `id` substituto. Isso expressa diretamente a regra de negócio (um usuário pertence a uma banda no máximo uma vez) e evita duplicidade sem constraint adicional. Consequência: `BandMemberEntity` não estende `BaseEntity` (que assume um único atributo `id`) — é uma entidade de domínio própria com `band_id` e `user_id` como identidade.

### Índices
A chave composta `(band_id, user_id)` já otimiza buscas por `band_id` (ou por `band_id` + `user_id`), pois `band_id` é a coluna líder do índice da PK. Como o inverso — "a quais bandas um usuário pertence" — é uma consulta igualmente esperada, é criado um índice dedicado em `user_id`.

### Transação atômica entre `bands` e `band_members`
`IBandRepository` ganha um novo método (`saveWithOwner(band, ownerUserId)`) responsável por persistir a banda e o vínculo de dono na mesma transação de banco. A implementação em `BandRepository` usa `DataSource.transaction()` internamente para gravar as duas tabelas e reverter ambas em caso de falha.

Alternativa considerada e rejeitada: introduzir um `IUnitOfWork`/`ITransactionRunner` genérico no domínio para coordenar múltiplos repositórios. Rejeitada por ser abstração desproporcional ao problema atual (duas inserções relacionadas); pode ser revisitada se surgir um terceiro caso de uso que precise compor repositórios distintos em uma mesma transação.

### Origem do `userId`
`BandController` passa a ler `request.user.id` (já populado pelo `JwtAuthGuard`) e repassar como segundo argumento de `CreateBandUseCaseInterface.execute(dto, userId)`. Nenhuma mudança é necessária no guard.

### `is_owner` sem constraint de unicidade por banda
`is_owner` é uma coluna booleana simples (`default: false`), sem constraint de banco garantindo exatamente um dono por banda. Neste momento apenas o fluxo de criação grava `is_owner = true`, então a invariante é mantida pela aplicação. Formalizar essa regra no banco (ex.: índice único parcial `WHERE is_owner = true`) fica em aberto para quando houver transferência de posse.

### `ON DELETE CASCADE` nas chaves estrangeiras
As FKs `band_id` e `user_id` em `band_members` usam `ON DELETE CASCADE`. Excluir uma banda ou um usuário remove automaticamente seus vínculos de membro, sem exigir limpeza manual pela aplicação. Como `bands` e `users` hoje só sofrem soft delete (`deleted_at`) pelos fluxos existentes, o cascade só é exercido em uma exclusão física real (ex.: rotina administrativa futura ou remoção direta no banco) — mas a constraint já garante a integridade referencial nesse cenário sem exigir mudança adicional quando ele existir.

### Validação da existência do usuário autenticado antes de criar a banda
Um JWT válido (assinatura e expiração corretas) não garante que o usuário referenciado por `sub` ainda existe em `users` — o registro pode ter sido excluído após o token ser emitido. **Motivação real observada**: durante testes manuais, um usuário autenticou-se normalmente, teve seu registro removido diretamente do banco (fora do fluxo da aplicação) e, ao tentar cadastrar uma banda com o mesmo token (ainda válido), a inserção em `band_members` violava a FK de `user_id` — o banco retornava um erro de constraint (HTTP 500), em vez de uma resposta de negócio previsível.

Por isso, `CreateBandUseCase` passa a depender também de `IUserRepository` e, antes de montar/persistir a `BandEntity`, chama `userRepository.findBy({ id: userId })`. Se não encontrar o usuário, lança `ApplicationNotFoundException` (HTTP 404) e não chega a persistir a banda nem o vínculo de dono — evitando que o erro de constraint do banco vaze para a API.

Essa checagem é feita fora da transação de `saveWithOwner`: é uma pré-condição de leitura, não faz parte da escrita atômica banda+membro. `UserFilter` (em `IUserRepository`) ganha o campo opcional `id`, reaproveitando o mesmo `findBy` já usado por `LoginUseCase`/`CreateUserUseCase` para busca por `email`.

`BandFactoryModule` passa a registrar `UserRepository` e `TypeOrmModule.forFeature([UserTypeormEntity])` também, seguindo o mesmo padrão já usado por `AuthFactoryModule` e `UserFactoryModule` (cada factory module resolve suas próprias dependências de infraestrutura, mesmo que isso duplique o registro do `UserTypeormEntity`/`UserRepository` entre módulos).

**Cobertura de testes desse cenário:**
- Unitário (`test/unit/application/usecase/band/create-band.usecase.spec.ts`): `userRepository.findBy` retornando `null` deve lançar `ApplicationNotFoundException` e `bandRepository.saveWithOwner` NÃO deve ser chamado.
- e2e (`test/e2e/band/create.e2e-spec.ts`, cenário "should return 404 when the authenticated user was deleted after the token was issued"): reproduz o incidente real — cria um usuário, autentica, remove o registro de `users` diretamente via `DataSource` (hard delete, sem passar pelo fluxo da aplicação) e então chama `POST /bands` com o token ainda válido, esperando HTTP 404. Esse teste foi verificado removendo temporariamente a validação do use case e confirmando que, sem ela, a requisição resulta em HTTP 500 por violação de constraint — provando que o teste de fato cobre o bug original.

## Risks / Trade-offs

- [Falha ao inserir o vínculo de dono após a banda já estar persistida] → Mitigado pela transação única em `saveWithOwner`; qualquer erro reverte a criação da banda também.
- [Ausência de constraint de unicidade para `is_owner = true`] → Aceito como trade-off consciente (ver Decisions); revisitar quando existir transferência de posse.
- [Novo método `saveWithOwner` amplia a interface `IBandRepository`] → Aceito porque a alternativa (Unit of Work genérico) adicionaria complexidade não solicitada; a interface permanece pequena e específica ao domínio de bandas.
- [Checagem de existência do usuário adiciona uma consulta extra antes da transação] → Aceito: é uma leitura simples por chave primária, e evita persistir um vínculo de dono órfão para um `user_id` inexistente.

## Migration Plan

1. Gerar migration `create-band-members-table` (`up`: cria tabela com PK composta, FKs para `bands.id` e `users.id`, índice em `user_id`; `down`: drop table)
2. Rodar `npm run migration:run` em cada ambiente antes do deploy do código que depende da tabela
3. Rollback: `npm run migration:revert` remove a tabela; seguro pois nenhuma outra tabela depende de `band_members`

## Open Questions

- Deve haver uma constraint de banco garantindo exatamente um `is_owner = true` por banda, ou isso será resolvido apenas quando a transferência de posse for implementada?
