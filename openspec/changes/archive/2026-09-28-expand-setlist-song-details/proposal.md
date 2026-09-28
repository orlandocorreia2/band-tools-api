## Why

O endpoint `GET /bands/{id}/setlists/{setlistId}/songs` retorna hoje apenas o `title` de cada música do setlist. Para usar o setlist durante um ensaio ou show (afinação, tom, andamento, duração, letra e observações), o cliente precisa fazer uma segunda chamada a `GET /bands/{id}/songs` e cruzar os dados manualmente. Retornar os detalhes da música direto na listagem do setlist elimina esse cruzamento e deixa o setlist autossuficiente para o palco.

Esta mudança revisa uma decisão tomada no change `list-setlist-songs` (arquivado em 2026-08-03), que optou por expor apenas o `title` para manter o payload enxuto. A necessidade de uso real do setlist mudou essa premissa.

## What Changes

- Cada item de `data` em `GET /bands/{id}/setlists/{setlistId}/songs` passa a incluir, além dos campos atuais, os dados da música vindos de `band_songs`: `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes`.
- Os novos campos seguem a projeção plana (achatada) já usada no item, sem aninhar um objeto `band_song`.
- Campos não preenchidos na música são retornados com valor `null`. O campo continua presente para manter o contrato de resposta estável para os clientes.
- Os campos atuais (`id`, `band_setlist_id`, `band_song_id`, `position`, `title`, `created_at`, `updated_at`) continuam com o mesmo significado. `created_at`/`updated_at` continuam sendo as datas do vínculo em `band_setlist_songs`.
- `band_id`, `created_at` e `updated_at` da música **não** são expostos: `band_id` já é o `:id` da rota, e as datas colidiriam com as do vínculo na projeção plana.
- A mudança é aditiva e não quebra compatibilidade: nenhum campo existente é removido ou renomeado.
- Ordenação por `position`, ausência de paginação, autenticação e validação de posse do setlist continuam como estão.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `band-setlist-songs`: o requisito "Listagem de músicas de um setlist" passa a exigir os campos `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` em cada item, com `null` quando não preenchidos.

## Impact

- **Entidades do domínio**: Música (`BandSongEntity`) já possui todos os campos, sem alteração. Vínculo setlist-música (`BandSetlistSongEntity`) sem alteração. Banda, Membro, Ensaio e Evento não são afetados.
- **Aplicação**: `ListSetlistSongsUseCase` já busca a `BandSongEntity` completa via `findAllByIds`, sem alteração de lógica.
- **HTTP / DTOs**: `SetlistSongResponseDto` (`src/shared/communication/dtos/band/setlist-song-response.dto.ts`) ganha os seis novos campos e a respectiva documentação Swagger (`@ApiPropertyOptional`).
- **Banco de dados**: nenhuma migration necessária, pois as colunas já existem em `band_songs`.
- **Payload**: respostas maiores, principalmente por causa de `lyrics` (`text`, sem limite).
- **Clientes**: apps Flutter/web podem passar a consumir os novos campos. Clientes atuais continuam funcionando.
- **Testes**: atualizar os specs unitários de `SetlistSongResponseDto` e o e2e `test/e2e/band-setlist-song/list.e2e-spec.ts`.
