# Tasks

## 1. Domain

- [x] 1.1 Adicionar `findAllByBandId(bandId: string): Promise<BandBookingEntity[]>` em `src/domain/repositories/band/band-booking.repository.interface.ts`
- [x] 1.2 Adicionar `findAllByIds(ids: string[]): Promise<ContactEntity[]>` em `src/domain/repositories/contact/contact.repository.interface.ts`, com comentário avisando que os IDs devem vir de fonte confiável (nunca do input do cliente) porque o método não filtra por `user_id`

## 2. Infrastructure

- [x] 2.1 Red: em `test/unit/infrastructure/repository/band/band-booking.repository.spec.ts`, testar `findAllByBandId` chamando `repository.find({ where: { band_id }, order: { date: 'ASC', start_time: 'ASC', created_at: 'ASC' } })` e devolvendo o resultado
- [x] 2.2 Green: implementar `findAllByBandId` em `src/infrastructure/repository/band/band-booking.repository.ts`
- [x] 2.3 Red: em `test/unit/infrastructure/repository/contact/contact.repository.spec.ts`, testar `findAllByIds` chamando `repository.findBy({ id: In(ids) })`, seguindo o padrão de `BandSongRepository.findAllByIds`
- [x] 2.4 Green: implementar `findAllByIds` em `src/infrastructure/repository/contact/contact.repository.ts`
- [x] 2.5 Atualizar `test/component/support/repositories/in-memory-band-booking.repository.ts` (`findAllByBandId` com a mesma ordenação) e `in-memory-contact.repository.ts` (`findAllByIds`)

## 3. Shared helper

- [x] 3.1 Red: criar `test/unit/shared/helpers/format-date-only.spec.ts` cobrindo `Date` em UTC 00:00 → `YYYY-MM-DD` e zero à esquerda em mês/dia
- [x] 3.2 Green: criar `src/shared/helpers/format-date-only.ts` e refatorar `dateColumnTransformer.to` em `band-booking-typeorm.entity.ts` para usá-lo (os testes existentes do transformer continuam verdes)

## 4. Application (Use Case)

- [x] 4.1 Criar `src/application/usecase/band/interfaces/list-band-bookings.usecase.interface.ts` com o tipo `BandBookingWithContact = { bandBooking: BandBookingEntity; contact: ContactEntity }` e `execute(bandId: string): Promise<BandBookingWithContact[]>`, e exportar no `interfaces/index.ts`
- [x] 4.2 Red: `test/unit/application/usecase/band/list-band-bookings.usecase.spec.ts` cobrindo: (a) banda sem agendamentos devolve `[]` e não chama `contactRepository.findAllByIds`; (b) agendamentos pareados com seus contatos, preservando a ordem do repositório; (c) `contact_id` repetido é buscado uma vez só (IDs deduplicados); (d) agendamento cujo contato não foi encontrado é omitido
- [x] 4.3 Green: implementar `src/application/usecase/band/list-band-bookings.usecase.ts` (métodos pequenos, sem `else`, um nível de indentação)

## 5. Shared DTOs

- [x] 5.1 Red: `test/unit/shared/communication/dtos/band/band-booking-response.dto.spec.ts` cobrindo: agendamento com todos os campos (incluindo `contact` aninhado via `BandBookingContactResponseDto`, sem `band_id`/`contact_id` no item e sem `user_id`/`created_at`/`updated_at` no contato), agendamento sem opcionais (`consumption`, `link`, `note` iguais a `null`), `date` como `YYYY-MM-DD` e `fromEntities`
- [x] 5.2 Green: criar `src/shared/communication/dtos/band/band-booking-response.dto.ts` com `@ApiProperty`/`@ApiPropertyOptional({ nullable: true })`, `status` documentado com `enum: BandBookingStatusEnum` e `contact` com `type: BandBookingContactResponseDto` (novo DTO em `src/shared/communication/dtos/band/band-booking-contact-response.dto.ts`, com spec próprio)
- [x] 5.3 Red: `test/unit/shared/communication/dtos/band/list-band-bookings-response.dto.spec.ts`
- [x] 5.4 Green: criar `src/shared/communication/dtos/band/list-band-bookings-response.dto.ts` (`data: BandBookingResponseDto[]`)

## 6. HTTP Layer

- [x] 6.1 Criar `src/http/band/decorators/list-band-bookings.decorator.ts` (`ApiListBandBookings()`) documentando 200 (`ListBandBookingsResponseDto`), 401, 403, 404, 422 e `HttpCode(OK)`
- [x] 6.2 Red: em `test/unit/http/band/band-factory.module.spec.ts`, cobrir o provider `LIST_BAND_BOOKINGS_USE_CASE`
- [x] 6.3 Green: registrar `LIST_BAND_BOOKINGS_USE_CASE` em `src/http/band/band-factory.module.ts` (inject `BandBookingRepository`, `ContactRepository`) e exportar
- [x] 6.4 Red: em `test/unit/http/band/band-booking.controller.spec.ts`, testar `list` chamando o use case com `params.id` e retornando `ListBandBookingsResponseDto.fromEntities`
- [x] 6.5 Green: adicionar `@ApiListBandBookings() @Get() list(@Param() params: FindIdParamDto)` em `src/http/band/band-booking.controller.ts`, herdando os guards da classe

## 7. Component tests

- [x] 7.1 Criar `test/component/band-booking/list.component-spec.ts` (bootstrap com `createComponentApp()`, `store.clearAll()` no `beforeEach`) cobrindo o contrato HTTP: 200 com `data` e `contact` aninhado, 200 com `data: []`, 401 sem token, 422 com `:id` inválido, 404 banda inexistente, 403 não membro

## 8. Testes e2e

- [x] 8.1 Criar `test/e2e/band-booking/list.e2e-spec.ts` cobrindo contra o PostgreSQL real: listagem com contato aninhado; lista vazia; ordenação por `date`/`start_time` com agendamentos inseridos fora de ordem; isolamento entre bandas; opcionais `null`; `date` `YYYY-MM-DD` e `fee` numérico; contato cadastrado por outro membro aparece sem `user_id`; `status` `Confirmed` persistido direto via repositório TypeORM é retornado como `Confirmed`; 401, 403, 404 e 422. Chamar `truncateAllTables` no `afterAll` antes de `app.close()`

## 9. Finalização

- [x] 9.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions e lines)
- [x] 9.2 Rodar `npm run test:component` e `npm run test:e2e` e confirmar que todos os cenários passam
- [x] 9.3 Rodar `npm run lint`, revisar Object Calisthenics e confirmar que nenhum log ou interceptor grava o payload da resposta (PII de contato)
- [x] 9.4 Conferir no Swagger/Scalar local (`npm run start:dev`) o schema de `ListBandBookingsResponseDto` com `contact` aninhado
