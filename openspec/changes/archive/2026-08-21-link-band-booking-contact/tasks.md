## 1. Repositório de contato

- [x] 1.1 Adicionar `findByIdAndUserId(id, userId)` em `IContactRepository` (`src/domain/repositories/contact/contact.repository.interface.ts`)
- [x] 1.2 Escrever teste unitário do novo método em `ContactRepository` (`test/unit/`) cobrindo contato encontrado, contato de outro usuário e contato inexistente
- [x] 1.3 Implementar `findByIdAndUserId` em `ContactRepository` (`src/infrastructure/repository/contact/contact.repository.ts`)

## 2. Migration do banco de dados

- [x] 2.1 Gerar migration (`npm run migration:generate -- --name=link-band-booking-contact`) alterando `band_bookings`: remover `focal_point_name`, `phone`, `address`; adicionar `contact_id uuid NOT NULL` com índice
- [x] 2.2 Adicionar constraint de FK `contact_id → user_contacts.id` com `ON DELETE RESTRICT` na migration
- [x] 2.3 Rodar `npm run migration:run` localmente e validar `npm run migration:revert` (rollback restaura as colunas antigas vazias, conforme design.md)

## 3. Entidades de domínio e infraestrutura

- [x] 3.1 Atualizar `BandBookingEntity` (`src/domain/entities/band/band-booking.entity.ts`): remover `focalPointName`/`phone`/`address`, adicionar `contactId`
- [x] 3.2 Atualizar `BandBookingTypeormEntity` (`src/infrastructure/entities/band/band-booking-typeorm.entity.ts`): remover as 3 colunas, adicionar `contact_id`

## 4. DTO e documentação Swagger

- [x] 4.1 Atualizar `CreateBandBookingDto` (`src/shared/communication/dtos/band/create-band-booking.dto.ts`): remover `focal_point_name`, `phone`, `address`; adicionar `contact_id: string` com `@IsUUID()`
- [x] 4.2 Atualizar `create-band-booking.decorator.ts` (Swagger `@ApiProperty`) para refletir o novo contrato — decorator já é genérico (sem campos nomeados), nenhuma mudança necessária; o contrato de campos é documentado via `@ApiProperty` no próprio DTO

## 5. Caso de uso de criação de agendamento

- [x] 5.1 Escrever teste unitário do `CreateBandBookingUseCase` para o cenário de contato inexistente → erro 404, sem persistir
- [x] 5.2 Escrever teste unitário do `CreateBandBookingUseCase` para o cenário de contato pertencente a outro usuário → erro 404, sem persistir
- [x] 5.3 Escrever teste unitário do `CreateBandBookingUseCase` para o cenário de contato válido e pertencente ao usuário autenticado → persiste o agendamento com `contact_id`
- [x] 5.4 Implementar a dependência de `IContactRepository` em `CreateBandBookingUseCase` e a validação de posse do contato (ordem: banda existe → usuário existe → é membro → contato existe e pertence ao usuário), fazendo os testes de 5.1-5.3 passarem
- [x] 5.5 Atualizar `BandBookingFactoryModule` para injetar `IContactRepository` no `CreateBandBookingUseCase` (arquivo real é `BandFactoryModule`, que já hospeda o caso de uso de booking)

## 6. Testes e2e

- [x] 6.1 Atualizar os testes e2e existentes de `POST /bands/:id/bookings` (`test/*.e2e-spec.ts`) para o novo contrato (`contact_id` no lugar de `focal_point_name`/`phone`/`address`)
- [x] 6.2 Adicionar cenário e2e: criação de agendamento com `contact_id` de outro usuário → HTTP 404
- [x] 6.3 Adicionar cenário e2e: criação de agendamento com `contact_id` inexistente → HTTP 404
- [x] 6.4 Adicionar cenário e2e: criação de agendamento com `contact_id` em formato inválido (não UUID) → HTTP 422

## 7. Validação final

- [x] 7.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions, lines)
- [x] 7.2 Rodar `npm run test:e2e` e confirmar todos os cenários passando
- [x] 7.3 Revisar Swagger (`/reference`) para confirmar que o contrato documentado reflete `contact_id` — verificado via `/openapi` no container dev: `contact_id` presente, `focal_point_name`/`phone`/`address` ausentes do schema `CreateBandBookingDto`
