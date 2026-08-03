## Why

Atualmente as bandas cadastram músicas no repertório (`band-repertoire`), mas não há como organizar um roteiro para um show específico. Este primeiro momento cobre apenas o cadastro do setlist em si (nome vinculado à banda); a associação de músicas ao setlist fica para uma proposta futura.

## What Changes

- Nova tabela `band_setlists`: `id`, `band_id` (FK para `bands`), `name`, `created_at`, `updated_at`
- Novo endpoint `POST /bands/:id/setlists`, autenticado (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`), que recebe apenas `name`

## Capabilities

### New Capabilities
- `band-setlists`: cadastro do nome de um setlist vinculado a uma banda

### Modified Capabilities
(nenhuma)

## Impact

- Nova entidade de domínio e TypeORM: `BandSetlistEntity`
- Nova migration criando `band_setlists`
- Novo módulo HTTP `band-setlist` (controller, factory module, DTO, decorator Swagger)
- Novo repositório `BandSetlistRepository` e use case `CreateBandSetlistUseCase`
- Reutiliza `JwtAuthGuard` e `AuthUserIsMemberBandGuard` já existentes em `band-song`
- Fora de escopo: frontend (item de menu, página de cadastro/listagem); associação de músicas do repertório ao setlist (`band_setlist_songs`, ordenação); endpoint de listagem de setlists — todos ficam para mudanças futuras
