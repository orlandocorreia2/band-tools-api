## Why

Ao cadastrar uma banda, atualmente não existe nenhum vínculo entre o usuário autenticado que fez a requisição e a banda criada. Isso impede que o sistema saiba quem administra cada banda e bloqueia funcionalidades futuras de gerenciamento de membros (convites, permissões, remoção). É necessário estabelecer esse vínculo agora, no momento da criação da banda, associando automaticamente o usuário autenticado como dono (owner) da banda recém-criada.

## What Changes

- Criação da migration `band_members`, tabela pivô do relacionamento N:N entre `users` e `bands`:
  - Colunas: `band_id` (uuid, FK para `bands.id`), `user_id` (uuid, FK para `users.id`), `is_owner` (boolean, default `false`), `created_at`, `updated_at`
  - Chave primária composta (`band_id`, `user_id`)
  - Índices de performance para otimizar buscas isoladas por `band_id` e por `user_id`
- Criação da entidade de domínio `BandMemberEntity` e da interface `IBandMemberRepository`
- Implementação de `BandMemberTypeormEntity` e `BandMemberRepository` na camada de infraestrutura
- Alteração do `CreateBandUseCase` para, ao persistir a nova banda, criar automaticamente o registro em `band_members` vinculando o `id` do usuário autenticado à banda recém-criada, com `is_owner = true`
- Alteração do `BandController` (`POST /bands`) para repassar ao use case o `id` do usuário autenticado, já disponibilizado em `request.user` pelo `JwtAuthGuard`
- A criação da banda e a criação do vínculo de membro dono DEVEM ocorrer na mesma transação de banco de dados — se o vínculo falhar, a criação da banda deve ser revertida
- `CreateBandUseCase` passa a validar, antes de criar a banda, que o usuário autenticado ainda existe em `users` — se não existir, a API retorna HTTP 404 e nada é persistido

## Capabilities

### New Capabilities
- `band-membership`: relacionamento N:N entre usuários e bandas por meio da tabela pivô `band_members`, incluindo o papel de dono (`is_owner`)

### Modified Capabilities
- `band-management`: ao cadastrar uma banda (`POST /bands`), o usuário autenticado passa a ser automaticamente vinculado como membro dono (`is_owner = true`) da banda criada

## Impact

- Nova migration `create-band-members-table` em `src/infrastructure/typeorm/migrations/`
- Novo `BandMemberEntity` em `src/domain/entities/band-member/`
- Nova interface `IBandMemberRepository` em `src/domain/repositories/band-member/`
- Novos `BandMemberTypeormEntity` e `BandMemberRepository` em `src/infrastructure/entities/band-member/` e `src/infrastructure/repository/band-member/`
- Alteração de `CreateBandUseCase` (`src/application/usecase/band/create-band.usecase.ts`) para receber o `userId` autenticado e criar o vínculo de dono na mesma transação
- Alteração de `BandController` (`src/http/band/band.controller.ts`) para extrair o usuário autenticado da requisição e repassá-lo ao use case
- Alteração de `BandFactoryModule` para conectar o novo repositório de membros e o `UserRepository` (usado para validar a existência do usuário)
- Alteração de `IUserRepository`/`UserFilter` (`src/domain/repositories/user/user.repository.interface.ts`) para permitir busca por `id`
