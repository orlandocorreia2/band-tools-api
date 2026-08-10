## Why

Atualmente não existe forma de registrar os agendamentos de shows e eventos de uma banda (data, horário, local e contato responsável). As bandas negociam esses compromissos por fora do sistema e perdem o histórico e o controle centralizado dessas informações.

## What Changes

- Nova tabela `band_bookings`: `id`, `band_id` (FK para `bands`), `title`, `focal_point_name`, `phone`, `date`, `start_time`, `duration`, `address`, `fee`, `status`, `consumption` (opcional), `link` (opcional), `note` (opcional), `created_at`, `updated_at`
- Novo endpoint `POST /bands/:id/bookings`, autenticado (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`), que recebe `title`, `focal_point_name`, `phone`, `date`, `start_time`, `duration`, `address`, `fee` (obrigatórios) e `consumption`, `link`, `note` (opcionais)
- `duration` representa o tempo de duração do show em texto livre (ex.: "1 hora", "40 minutos")
- `fee` representa o cachê do show em reais (BRL); aceita valor `0` para shows gratuitos, mas não valores negativos
- `status` indica a situação do agendamento (`Pending`, `Confirmed`, `Cancelled`); NÃO é aceito no corpo da requisição — todo agendamento é criado com `status` igual a `Pending`
- Validação do `phone` no formato brasileiro, armazenado sem máscara (somente dígitos, 10 ou 11 caracteres — fixo ou celular com o dígito 9)
- Validação de que a combinação `date` + `start_time` é futura em relação ao momento do cadastro (não permite agendar em data/hora já passada)

## Capabilities

### New Capabilities
- `band-bookings`: cadastro de agendamentos de shows e eventos vinculados a uma banda

### Modified Capabilities
(nenhuma)

## Impact

- Nova entidade de domínio e TypeORM: `BandBookingEntity`
- Nova migration criando `band_bookings`
- Novo módulo HTTP `band-booking` (controller, factory module, DTO, decorator Swagger)
- Novo repositório `BandBookingRepository` e use case `CreateBandBookingUseCase`
- Reutiliza `JwtAuthGuard` e `AuthUserIsMemberBandGuard` já existentes em `band-setlist`
- Fora de escopo: listagem, edição e remoção de agendamentos; notificações/lembretes; associação com setlist do show — ficam para mudanças futuras
