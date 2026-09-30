## Why

Hoje a banda consegue cadastrar agendamentos de shows/eventos (`POST /bands/:id/bookings`), mas não tem como consultá-los. Sem uma listagem, os membros não enxergam a agenda da banda e o cliente (Flutter/web) não consegue montar a tela de agenda. Cada agendamento também depende do contato (ponto focal do evento) para ser útil: sem nome, telefone e local do contato, o membro não sabe com quem falar nem para onde ir.

## What Changes

- Novo endpoint `GET /bands/:id/bookings`, autenticado (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`), no mesmo controller do cadastro (`BandBookingController`).
- A resposta segue o padrão das outras listagens: `{ "data": [...] }`, HTTP 200.
- Cada item de `data` traz os campos do agendamento (`id`, `title`, `date`, `start_time`, `duration`, `fee`, `status`, `consumption`, `link`, `note`, `created_at`, `updated_at`) e um objeto aninhado `contact` (`id`, `name`, `phone`, `alternate_phone`, `venue_name`, `address`, `email`, `role`, `notes`).
- `band_id` e `contact_id` não são retornados porque são redundantes: o primeiro já é o `:id` da rota e o segundo já é o `contact.id`. O `contact` também não traz `created_at`/`updated_at`.
- `date` é devolvido como `YYYY-MM-DD`, o mesmo formato aceito no cadastro.
- Campos opcionais do agendamento sem valor (`consumption`, `link`, `note`) vêm como `null`, mantendo o contrato estável.
- Os agendamentos são ordenados em ordem cronológica (`date` ASC, `start_time` ASC).
- A listagem traz todos os agendamentos da banda, de qualquer `status` e incluindo os que já passaram. Sem paginação e sem filtros nesta mudança.
- A mudança é aditiva: o cadastro de agendamentos não muda.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `band-bookings`: adiciona os requisitos "Listagem de agendamentos da banda" e "Autenticação e vínculo do usuário com a banda na listagem de agendamentos".

## Impact

- **Entidades do domínio**: Evento/agendamento (`BandBookingEntity`) e Contato (`ContactEntity`) são lidos, sem alteração de campos. Banda e Membro participam só da autorização (guard existente). Música e Ensaio não são afetados.
- **Domínio / repositórios**: `IBandBookingRepository` ganha `findAllByBandId(bandId)`. `IContactRepository` ganha `findAllByIds(ids)`.
- **Aplicação**: novo `ListBandBookingsUseCase` (+ interface), que busca os agendamentos da banda e os contatos em lote e devolve pares `{ bandBooking, contact }`.
- **HTTP / DTOs**: novos `BandBookingResponseDto` e `ListBandBookingsResponseDto`, decorator Swagger `ApiListBandBookings`, novo método `list` em `BandBookingController` e novo provider `LIST_BAND_BOOKINGS_USE_CASE` em `BandFactoryModule`. Novo `BandBookingContactResponseDto` para o contato aninhado (`ContactResponseDto` e `GET /users/contacts` não mudam).
- **Banco de dados**: nenhuma migration. `band_bookings.band_id` e `band_bookings.contact_id` já têm índice, e a FK para `user_contacts` já existe.
- **Privacidade (LGPD)**: os dados do contato (telefone, e-mail, endereço) passam a ser visíveis para todos os membros da banda, e não só para o usuário que cadastrou o contato. Ver design.md, Risks.
- **Testes**: unitários (repositórios, use case, DTOs, controller, factory module), component test (`test/component/band-booking/`) e e2e (`test/e2e/band-booking/list.e2e-spec.ts`). Os in-memory repositories de booking e contato ganham os novos métodos.
