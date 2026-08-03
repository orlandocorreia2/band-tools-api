## Why

Hoje é possível cadastrar um setlist para uma banda (`POST /bands/:id/setlists`), mas não existe nenhuma forma de consultar quais setlists já foram cadastrados. Sem um endpoint de listagem, nenhum cliente (web/mobile) consegue exibir os setlists de uma banda.

## What Changes

- Adiciona o endpoint `GET /bands/{bandId}/setlists`, protegido por autenticação (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`, já reutilizado do endpoint de cadastro), que retorna todos os setlists da banda informada.
- A resposta segue o envelope `{ "data": [...] }`, com o array de setlists (e suas informações) contido na chave `data`.
- A listagem NÃO é paginada — retorna o conjunto completo de setlists da banda em uma única resposta.
- Introduz o primeiro caso de uso de leitura do domínio de setlists (`ListBandSetlistsUseCase`) e o response DTO correspondente, seguindo o mesmo padrão já estabelecido em `GET /bands/{bandId}/songs`.
- Adiciona ao `IBandSetlistRepository` um método de consulta que filtra setlists pelo `band_id`.

## Capabilities

### New Capabilities
(nenhuma capability nova — o endpoint é uma nova forma de interação com o domínio de setlists já existente)

### Modified Capabilities
- `band-setlists`: adiciona o requisito "Listagem de setlists da banda" (`GET /bands/{bandId}/setlists`), cobrindo autenticação obrigatória, vínculo do usuário autenticado com a banda (via `AuthUserIsMemberBandGuard`), e ausência de paginação.

## Impact

- **Domínio**: `IBandSetlistRepository` (nova assinatura de método de busca por `band_id`).
- **Aplicação**: novo use case de listagem (`src/application/usecase/band-setlist/`).
- **Infraestrutura**: `BandSetlistRepository` (nova query filtrada por `band_id`, já indexado).
- **HTTP**: `BandSetlistController` (novo método `GET :id/setlists`), `BandSetlistFactoryModule` (novo provider), novo response DTO em `src/shared/communication/dtos/band-setlist/`.
- **Testes**: novos specs unitários (use case, controller, repositório, DTO) e e2e (`test/e2e/band-setlist/list.e2e-spec.ts`).
- Nenhuma alteração de schema/migration é necessária — a tabela `band_setlists` já existe.
