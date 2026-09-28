## MODIFIED Requirements

### Requirement: Listagem de músicas de um setlist
O sistema DEVE (SHALL) permitir consultar todas as músicas associadas a um setlist através de `GET /bands/{id}/setlists/{setlistId}/songs`.

A resposta DEVE seguir o envelope `{ "data": [...] }`, onde cada item é um objeto plano contendo:
- `id`: UUID do vínculo em `band_setlist_songs`
- `band_setlist_id`: UUID do setlist (`band_setlists.id`)
- `band_song_id`: UUID da música (`band_songs.id`)
- `position`: número inteiro, a posição da música no setlist
- `title`: nome da música, obtido de `band_songs.title`
- `tuning`: afinação da música, obtida de `band_songs.tuning` (string ou `null`)
- `tonality`: tonalidade da música, obtida de `band_songs.tonality` (string ou `null`)
- `bpm`: andamento da música em batidas por minuto, obtido de `band_songs.bpm` (número inteiro ou `null`)
- `duration`: duração da música em segundos, obtida de `band_songs.duration` (número inteiro ou `null`)
- `lyrics`: letra da música, obtida de `band_songs.lyrics` (string ou `null`)
- `notes`: observações da música, obtidas de `band_songs.notes` (string ou `null`)
- `created_at`: data de criação do vínculo em `band_setlist_songs`
- `updated_at`: data de atualização do vínculo em `band_setlist_songs`

Os campos `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` DEVEM estar sempre presentes em cada item. Quando o valor correspondente não estiver preenchido na música, o campo DEVE ser retornado com valor `null`.

A resposta NÃO DEVE expor `band_id`, `created_at` nem `updated_at` da música (`band_songs`). `created_at` e `updated_at` referem-se exclusivamente ao vínculo em `band_setlist_songs`.

O array `data` DEVE estar ordenado por `position` ascendente. A listagem NÃO É paginada e retorna o conjunto completo de músicas do setlist em uma única resposta.

#### Scenario: Listagem de setlist com músicas cadastradas
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada por um usuário autenticado e membro da banda `:id`, para um setlist existente que possui músicas associadas com posições `1`, `2` e `3`
- **THEN** o sistema DEVE retornar HTTP 200 com `data` contendo os três vínculos, cada um com `id`, `band_setlist_id`, `band_song_id`, `position`, `title`, `tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes`, `created_at` e `updated_at`, ordenados de `1` a `3`

#### Scenario: Música do setlist com todos os detalhes preenchidos
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada para um setlist que contém uma música cadastrada com `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` preenchidos
- **THEN** o item correspondente em `data` DEVE conter `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` com os mesmos valores cadastrados para a música

#### Scenario: Música do setlist sem os detalhes opcionais preenchidos
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada para um setlist que contém uma música cadastrada apenas com `title`
- **THEN** o item correspondente em `data` DEVE conter `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` com valor `null`

#### Scenario: Datas retornadas pertencem ao vínculo, não à música
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada para um setlist cuja música foi cadastrada em `band_songs` antes de ser associada ao setlist
- **THEN** `created_at` e `updated_at` de cada item DEVEM corresponder às datas do vínculo em `band_setlist_songs`, e o item NÃO DEVE conter `band_id`

#### Scenario: Listagem de setlist sem nenhuma música associada
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada para um setlist existente e pertencente à banda `:id`, mas que ainda não possui nenhuma música associada
- **THEN** o sistema DEVE retornar HTTP 200 com `data` igual a um array vazio
