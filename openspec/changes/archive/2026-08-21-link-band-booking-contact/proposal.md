## Why

Hoje o cadastro de agendamento (`POST /bands/:id/bookings`) duplica dados de contato (`focal_point_name`, `phone`, `address`) como campos de texto livre, mesmo já existindo a entidade `Contact` (`user_contacts`) para armazenar essas mesmas informações. Essa duplicação obriga o usuário a redigitar dados já cadastrados e cria risco de inconsistência entre o contato salvo e o contato informado no agendamento.

## What Changes

- **BREAKING**: `CreateBandBookingDto` passa a exigir `contact_id` (UUID) no lugar de `focal_point_name`, `phone` e `address`.
- **BREAKING**: a tabela `band_bookings` perde as colunas `focal_point_name`, `phone` e `address` e passa a ter a coluna `contact_id`, com FK para `user_contacts.id`.
- O sistema passa a validar que o `contact_id` informado corresponde a um contato existente e pertencente ao usuário autenticado (mesma regra de isolamento por `user_id` já aplicada na listagem de contatos), rejeitando referências a contatos de outros usuários ou inexistentes.
- A interface de repositório de contatos (`IContactRepository`) ganha um método de busca por `id` + `user_id`, usado pelo caso de uso de criação de agendamento para validar a posse do contato antes de persistir.
- A FK `contact_id → user_contacts.id` impede a exclusão de um contato referenciado por algum agendamento (sem cascata), já que não há hoje endpoint de exclusão de contato, mas o comportamento deve ser definido para não deixar agendamentos com referência órfã no futuro.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `band-bookings`: o requisito de cadastro de agendamento muda o contrato de entrada (remove `focal_point_name`/`phone`/`address`, adiciona `contact_id`) e ganha um novo requisito de validação de posse do contato referenciado.

## Impact

- **DTO**: `src/shared/communication/dtos/band/create-band-booking.dto.ts` — remove 3 campos, adiciona `contact_id` com `@IsUUID()`.
- **Migration**: nova migration em `src/infrastructure/typeorm/migrations/` alterando `band_bookings` (drop de 3 colunas, add `contact_id uuid NOT NULL` com FK para `user_contacts.id`, índice).
- **Entidades**: `BandBookingEntity` (domínio) e `BandBookingTypeormEntity` (infraestrutura) — troca dos 3 campos por `contact_id`.
- **Repositório de contato**: `IContactRepository` e `ContactRepository` — novo método de busca por `id` + `user_id`.
- **Caso de uso**: `CreateBandBookingUseCase` passa a depender de `IContactRepository` para validar a posse do contato antes de persistir o agendamento.
- **Controller/Swagger**: `band-booking.controller.ts` e `create-band-booking.decorator.ts` — atualização da documentação do endpoint.
- **Testes**: specs unitários e e2e existentes de criação de agendamento precisam ser reescritos para o novo contrato.
