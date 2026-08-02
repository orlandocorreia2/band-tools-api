## Why

Hoje é possível cadastrar uma música no repertório de uma banda (`POST /bands/:id/song`), mas não existe nenhuma forma de consultar quais músicas já foram cadastradas. Sem um endpoint de listagem, nenhum cliente (web/mobile) consegue exibir o repertório de uma banda.

## What Changes

- Adiciona o endpoint `GET /bands/{bandId}/songs`, protegido por autenticação (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`, já reutilizado do endpoint de cadastro), que retorna todas as músicas do repertório da banda informada.
- A resposta segue o envelope `{ "data": [...] }`, com o array de músicas (e suas informações) contido na chave `data`.
- A listagem NÃO é paginada — retorna o conjunto completo de músicas da banda em uma única resposta.
- Introduz o primeiro caso de uso de leitura do domínio de repertório (`ListBandSongsUseCase`) e o response DTO correspondente, seguindo o mesmo padrão já estabelecido em `GET /bands`.
- Adiciona ao `IBandSongRepository` um método de consulta que filtra músicas pelo `band_id`.
- **BREAKING**: renomeia o endpoint existente de cadastro de `POST /bands/{bandId}/song` (singular) para `POST /bands/{bandId}/songs` (plural), unificando o nome do recurso com o novo endpoint de listagem. Clientes que ainda chamam a rota singular passam a receber 404.

## Capabilities

### New Capabilities
(nenhuma capability nova — o endpoint é uma nova forma de interação com o repertório já existente)

### Modified Capabilities
- `band-repertoire`: adiciona o requisito "Listagem de músicas do repertório da banda" (`GET /bands/{bandId}/songs`), cobrindo autenticação obrigatória, vínculo do usuário autenticado com a banda (via `AuthUserIsMemberBandGuard`), e ausência de paginação. Também atualiza os requisitos "Cadastro de música no repertório da banda" e "Autenticação e vínculo do usuário com a banda no cadastro de música" para refletir a rota renomeada (`POST /bands/{bandId}/songs`, plural).

## Impact

- **Domínio**: `IBandSongRepository` (nova assinatura de método de busca por `band_id`).
- **Aplicação**: novo use case de listagem (`src/application/usecase/band-song/`).
- **Infraestrutura**: `BandSongRepository` (nova query filtrada por `band_id`, já indexado).
- **HTTP**: `BandSongController` (novo método `GET :id/songs`), `BandSongFactoryModule` (novo provider), novo response DTO em `src/shared/communication/dtos/band-song/`.
- **Testes**: novos specs unitários (use case, controller, repositório, DTO) e e2e (`test/e2e/band-song/list.e2e-spec.ts`).
- Nenhuma alteração de schema/migration é necessária — a tabela `band_songs` já existe e já possui índice em `band_id`.
