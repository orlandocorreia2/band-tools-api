## Why

Já é possível cadastrar músicas em um setlist (`POST /bands/:id/setlists/:setlistId/songs`), mas não existe forma de consultar quais músicas já foram associadas a um setlist e em qual ordem. Sem um endpoint de listagem, nenhum cliente (web/mobile) consegue exibir a lista de músicas que serão tocadas em um show.

## What Changes

- Adiciona o endpoint `GET /bands/{id}/setlists/{setlistId}/songs`, protegido por autenticação (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`, já aplicados no `BandSetlistSongController`), que retorna todas as músicas associadas ao setlist informado.
- A resposta segue o envelope `{ "data": [...] }`, com cada item trazendo um objeto plano: `id` do vínculo, `band_setlist_id`, `band_song_id`, `position`, `title` (nome da música) e as datas `created_at`/`updated_at` do vínculo — sem aninhar os demais campos da música (`tuning`, `tonality`, `bpm`, etc.), disponíveis via `GET /bands/{id}/songs`.
- A listagem é ordenada por `position` ascendente, refletindo a ordem real de execução das músicas no show.
- A listagem NÃO é paginada — retorna o conjunto completo de músicas do setlist em uma única resposta, mesmo padrão já adotado em `GET /bands/{id}/setlists` e `GET /bands/{id}/songs`.
- Antes de listar, o sistema valida que o setlist referenciado por `:setlistId` existe e pertence à banda `:id` (mesma validação já usada em `POST /bands/:id/setlists/:setlistId/songs`).
- Introduz o primeiro caso de uso de leitura do domínio de vínculos setlist-música (`ListSetlistSongsUseCase`) e o response DTO correspondente.
- Adiciona ao `IBandSongRepository` um método de busca em lote por IDs (`findAllByIds`), usado para resolver os dados completos das músicas do setlist em uma única consulta.

## Capabilities

### New Capabilities
(nenhuma capability nova — o endpoint é uma nova forma de interação com a capability `band-setlist-songs` já existente)

### Modified Capabilities
- `band-setlist-songs`: adiciona o requisito "Listagem de músicas de um setlist" (`GET /bands/{id}/setlists/{setlistId}/songs`), cobrindo autenticação obrigatória, vínculo do usuário autenticado com a banda, validação de posse do setlist pela banda, ordenação por `position` e ausência de paginação.

## Impact

- **Domínio**: `IBandSongRepository` (nova assinatura de método `findAllByIds`).
- **Aplicação**: novo use case de listagem (`src/application/usecase/band/list-setlist-songs.usecase.ts` + interface).
- **Infraestrutura**: `BandSongRepository` (nova query com `In(ids)`, já indexado por `band_id`/`id`).
- **HTTP**: `BandSetlistSongController` (novo método `GET :id/setlists/:setlistId/songs`), `BandFactoryModule` (novo provider/token), novos response DTOs em `src/shared/communication/dtos/band/` com projeção plana do vínculo + nome da música.
- **Testes**: novos specs unitários (use case, controller, repositório, DTOs) e e2e (`test/e2e/band-setlist-song/list.e2e-spec.ts`).
- Nenhuma alteração de schema/migration é necessária — a tabela `band_setlist_songs` já existe.
