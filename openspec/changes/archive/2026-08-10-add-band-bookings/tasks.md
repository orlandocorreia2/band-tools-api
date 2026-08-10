## 1. Migration

- [x] 1.1 Gerar migration `create-band-bookings-table` criando `band_bookings` (`id`, `band_id` FK → `bands.id` `ON DELETE CASCADE` indexado, `title`, `focal_point_name`, `phone` varchar(11), `date`, `start_time`, `duration`, `address`, `fee` numeric(10,2), `status` varchar default `'Pending'` (coluna simples — NÃO usar `type: 'enum'` do TypeORM/PostgreSQL), `consumption` nullable, `link` nullable, `note` nullable, `created_at`, `updated_at`)
- [x] 1.2 Rodar `npm run migration:run` localmente e validar `up`/`down` (revert + run novamente)

## 2. Domínio e infraestrutura (entidades)

- [x] 2.1 Criar `BandBookingStatusEnum` em `src/shared/commons/enums/band-booking.enum.ts` (`Pending`, `Confirmed`, `Cancelled`) e exportar em `src/shared/commons/enums/index.ts`
- [x] 2.2 Criar `BandBookingEntity` em `src/domain/entities/band/band-booking.entity.ts` (estende `BaseEntity`; campos `band_id`, `title`, `focal_point_name`, `phone`, `date`, `start_time`, `duration`, `address`, `fee`, `status`, `consumption`, `link`, `note`; sempre define `status = BandBookingStatusEnum.Pending` na construção, sem receber `status` como parâmetro de entrada)
- [x] 2.3 Criar `BandBookingTypeormEntity` em `src/infrastructure/entities/band/band-booking-typeorm.entity.ts` (coluna `fee` como `decimal(10,2)` com `transformer` para expor `number`; coluna `status` como `varchar` simples, sem `type: 'enum'`; coluna `date` com `transformer` explícito (`dateColumnTransformer`) para não depender do fuso horário do processo — o serializador padrão do TypeORM para colunas `date` usa getters locais e persiste o dia errado em processos rodando em fuso atrás de UTC)

## 3. Repositório

- [x] 3.1 Escrever teste unitário para `BandBookingRepository.save` (persiste o agendamento, seguindo o padrão de `BandSetlistRepository.save`)
- [x] 3.2 Definir `IBandBookingRepository` em `src/domain/repositories/band/band-booking.repository.interface.ts` (`save(booking): Promise<void>`)
- [x] 3.3 Implementar `BandBookingRepository` em `src/infrastructure/repository/band/band-booking.repository.ts` até o teste passar

## 4. Caso de uso

- [x] 4.1 Escrever testes unitários para `CreateBandBookingUseCase`: cria agendamento com campos obrigatórios válidos (incluindo `fee` igual a `0`) sempre com `status` igual a `Pending`; cria agendamento com campos opcionais preenchidos; lança `ApplicationUnprocessableEntityException` quando `date` é anterior à data atual; lança `ApplicationUnprocessableEntityException` quando `date` é a data atual e `start_time` já passou; cria agendamento quando `date` é a data atual e `start_time` ainda é futuro
- [x] 4.2 Implementar `CreateBandBookingUseCaseInterface` em `src/application/usecase/band/interfaces/create-band-booking.usecase.interface.ts`
- [x] 4.3 Implementar `CreateBandBookingUseCase` em `src/application/usecase/band/create-band-booking.usecase.ts` até os testes passarem

## 5. DTO e documentação Swagger

- [x] 5.1 Criar `CreateBandBookingDto` em `src/shared/communication/dtos/band/create-band-booking.dto.ts` com `title`, `focal_point_name`, `phone` (regex `^\d{10,11}$` — somente dígitos, sem máscara), `date` (`@Type(() => Date)` + `@IsDate()`), `start_time` (regex `HH:mm`), `duration`, `address`, `fee` (`@IsNumber({ maxDecimalPlaces: 2 })` + `@Min(0)` + `@Max(99999999.99)` — teto igual à capacidade da coluna `numeric(10,2)`, evitando que overflow do banco vaze como HTTP 500, e limite de casas decimais evitando arredondamento silencioso) obrigatórios, e `consumption`, `link` (`@IsUrl()`), `note` opcionais — DTO NÃO possui campo `status` (descartado pelo `ValidationPipe` com `whitelist: true` caso enviado)
- [x] 5.2 Escrever teste unitário validando o DTO (campos obrigatórios ausentes, `phone` inválido, `phone` com máscara, `start_time` em formato inválido, `fee` negativo, `fee` acima do limite, `fee` com mais de 2 casas decimais, `link` inválido)
- [x] 5.3 Criar decorator Swagger `ApiCreateBandBooking` em `src/http/band/decorators/create-band-booking.decorator.ts`, documentando 201/400/401/403/404/422

## 6. Camada HTTP

- [x] 6.1 Adicionar token `CREATE_BAND_BOOKING_USE_CASE` e o provider correspondente em `src/http/band/band-factory.module.ts` (registrar `BandBookingTypeormEntity` e `BandBookingRepository`)
- [x] 6.2 Criar `BandBookingController` em `src/http/band/band-booking.controller.ts` com `POST /bands/:id/bookings`, `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)`
- [x] 6.3 Registrar `BandBookingController` em `src/http/http.module.ts`

## 7. Testes e2e

- [x] 7.1 Escrever teste e2e: cadastro com todos os campos obrigatórios válidos retorna 201 e persiste o agendamento com `status` igual a `Pending`
- [x] 7.2 Escrever teste e2e: cadastro com campos opcionais (`consumption`, `link`, `note`) preenchidos e sem eles
- [x] 7.3 Escrever teste e2e: cadastro com `fee` igual a `0` (show gratuito) retorna 201 e persiste
- [x] 7.4 Escrever teste e2e: campo obrigatório ausente/vazio retorna 422
- [x] 7.5 Escrever teste e2e: `phone` em formato inválido retorna 422 (incluindo `phone` com máscara, ex.: `(11) 98765-4321`)
- [x] 7.6 Escrever teste e2e: `fee` negativo retorna 422; `fee` acima de `99999999.99` retorna 422 (não 500); `fee` com mais de 2 casas decimais retorna 422
- [x] 7.7 Escrever teste e2e: `link` em formato inválido retorna 422
- [x] 7.8 Escrever teste e2e: `status` enviado pelo cliente no corpo da requisição é ignorado e o agendamento é persistido com `status` igual a `Pending`
- [x] 7.9 Escrever teste e2e: `date` anterior à data atual retorna 422 e não persiste
- [x] 7.10 Escrever teste e2e: `date` igual à data atual com `start_time` já passado retorna 422 e não persiste
- [x] 7.11 Escrever teste e2e: `date` igual à data atual com `start_time` futuro retorna 201 e persiste
- [x] 7.12 Escrever teste e2e: banda inexistente (404), usuário autenticado inexistente (404), usuário não membro (403), sem autenticação (401)
- [x] 7.13 Escrever teste e2e: corpo malformado retorna 400

## 8. Finalização

- [x] 8.1 Rodar `npm run test:cov` e garantir 100% de cobertura (statements, branches, functions, lines)
- [x] 8.2 Rodar `npm run test:e2e` e garantir todos os testes passando
- [x] 8.3 Rodar lint/format (`npm run lint`, `npm run format` se aplicável) antes do commit
