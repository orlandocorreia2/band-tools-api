## ADDED Requirements

### Requirement: Listagem de músicas de um setlist
O sistema DEVE (SHALL) permitir consultar todas as músicas associadas a um setlist através de `GET /bands/{id}/setlists/{setlistId}/songs`.

A resposta DEVE seguir o envelope `{ "data": [...] }`, onde cada item é um objeto plano contendo:
- `id`: UUID do vínculo em `band_setlist_songs`
- `band_setlist_id`: UUID do setlist (`band_setlists.id`)
- `band_song_id`: UUID da música (`band_songs.id`)
- `position`: número inteiro, a posição da música no setlist
- `title`: nome da música, obtido de `band_songs.title`
- `created_at`: data de criação do vínculo em `band_setlist_songs`
- `updated_at`: data de atualização do vínculo em `band_setlist_songs`

O array `data` DEVE estar ordenado por `position` ascendente. A listagem NÃO É paginada — retorna o conjunto completo de músicas do setlist em uma única resposta.

#### Scenario: Listagem de setlist com músicas cadastradas
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada por um usuário autenticado e membro da banda `:id`, para um setlist existente que possui músicas associadas com posições `1`, `2` e `3`
- **THEN** o sistema DEVE retornar HTTP 200 com `data` contendo os três vínculos, cada um com `id`, `band_setlist_id`, `band_song_id`, `position`, `title`, `created_at` e `updated_at`, ordenados de `1` a `3`

#### Scenario: Listagem de setlist sem nenhuma música associada
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada para um setlist existente e pertencente à banda `:id`, mas que ainda não possui nenhuma música associada
- **THEN** o sistema DEVE retornar HTTP 200 com `data` igual a um array vazio

### Requirement: Autenticação e vínculo do usuário com a banda na listagem de músicas do setlist
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e realizar as seguintes verificações, nesta ordem, antes de retornar a listagem:

1. A banda referenciada pelo parâmetro `:id` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404.
2. O usuário autenticado DEVE existir na tabela `users`; caso não exista, o sistema DEVE retornar HTTP 404.
3. O usuário autenticado DEVE ser membro da banda (DEVE existir um registro correspondente em `band_members` para o par banda/usuário); caso não seja, o sistema DEVE retornar HTTP 403.

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP 404

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `:id`
- **THEN** o sistema DEVE retornar HTTP 403

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401

### Requirement: Validação de posse do setlist pela banda na listagem
O sistema DEVE (SHALL), após as verificações de autenticação e associação à banda, validar que o setlist referenciado por `:setlistId` existe e pertence à banda `:id` antes de retornar a listagem.

#### Scenario: Setlist informado não existe
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada com um `:setlistId` que não corresponde a nenhum setlist cadastrado
- **THEN** o sistema DEVE retornar HTTP 404

#### Scenario: Setlist informado pertence a outra banda
- **WHEN** uma requisição `GET /bands/:id/setlists/:setlistId/songs` é enviada com um `:setlistId` que existe, mas está vinculado a uma banda diferente de `:id`
- **THEN** o sistema DEVE retornar HTTP 404
