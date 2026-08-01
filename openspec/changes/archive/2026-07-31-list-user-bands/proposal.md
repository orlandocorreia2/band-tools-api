## Why

Hoje não existe nenhuma forma de um usuário autenticado consultar quais bandas ele integra ou criou — a API só permite criar bandas (`POST /bands`), mas não listá-las. Sem esse endpoint, qualquer cliente (web/mobile) não tem como montar a tela inicial de "minhas bandas".

## What Changes

- Adiciona o endpoint `GET /bands`, protegido por `JwtAuthGuard`, que retorna todas as bandas às quais o usuário autenticado pertence (vínculo em `band_members`), incluindo as que ele criou (`is_owner = true`).
- A listagem NÃO é paginada — retorna o conjunto completo de bandas do usuário em uma única resposta.
- Introduz o primeiro caso de uso de leitura (`ListBandsByUserUseCase`) e a primeira camada de resposta (response DTO) do projeto, já que hoje só existem endpoints de escrita.
- Adiciona ao `IBandRepository` um método de consulta que filtra bandas pelo relacionamento em `band_members` (join/filtro por `user_id`), sem expor detalhes de TypeORM às camadas superiores.

## Capabilities

### New Capabilities
(nenhuma capability nova — o endpoint é uma nova forma de interação com bandas já existentes)

### Modified Capabilities
- `band-management`: adiciona o requisito "Listar bandas do usuário autenticado" (`GET /bands`), cobrindo autenticação obrigatória, filtro pelo usuário logado via `band_members`, e ausência de paginação.

## Impact

- **Domínio**: `IBandRepository` (nova assinatura de método de busca por usuário).
- **Aplicação**: novo use case de listagem (`src/application/usecase/band/`).
- **Infraestrutura**: `BandRepository` (nova query/join com `band_members`).
- **HTTP**: `BandController` (novo método `GET /bands`), `BandFactoryModule` (novo provider), novo response DTO em `src/shared/communication/dtos/band/`.
- **Testes**: novos specs unitários (use case, controller, repositório, DTO) e e2e (`test/e2e/band/list.e2e-spec.ts`).
- Nenhuma alteração de schema/migration é necessária — a tabela `band_members` já existe e já possui índice em `user_id`.
