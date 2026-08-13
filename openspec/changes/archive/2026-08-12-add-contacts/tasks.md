## 1. Migrations

- [x] 1.1 Criar migration `create-user-contacts-table` (tabela `user_contacts`: `id uuid` PK; `user_id uuid` FK obrigatória para `users` com `onDelete: CASCADE` e índice nomeado `IDX_user_contacts_user_id`; `name`, `phone`, `venue_name`, `address`, `email`, `role` obrigatórios (`isNullable: false`); `alternate_phone` e `notes` nullable; `created_at`, `updated_at`)
- [x] 1.2 Escrever teste unitário da migration (`up`/`down`), seguindo o padrão de `1786145039439-create-band-bookings-table.spec.ts`
- [x] 1.3 Rodar `npm run migration:run` localmente e validar a criação da tabela

## 2. Domínio

- [x] 2.1 Criar `ContactEntity` em `src/domain/entities/contact/contact.entity.ts` (props: `id`, `user_id`, `name`, `phone`, `venue_name`, `address`, `email`, `role`, `alternate_phone?`, `notes?`, `created_at?`, `updated_at?`)
- [x] 2.2 Criar interface `IContactRepository` em `src/domain/repositories/contact/contact.repository.interface.ts` com `save(contact: ContactEntity): Promise<void>`

## 3. Infraestrutura — TypeORM

- [x] 3.1 Criar `ContactTypeormEntity` em `src/infrastructure/entities/contact/contact-typeorm.entity.ts` (`@Entity('user_contacts')`, colunas explícitas incluindo `user_id`)
- [x] 3.2 Escrever teste unitário de mapeamento da entidade TypeORM

## 4. Infraestrutura — Repositório

- [x] 4.1 Escrever teste unitário de `ContactRepository.save()` cobrindo a criação do contato com `user_id` preenchido, seguindo o padrão de `BandBookingRepository`
- [x] 4.2 Implementar `ContactRepository` em `src/infrastructure/repository/contact/contact.repository.ts`

## 5. DTO de comunicação

- [x] 5.1 Escrever teste unitário de `CreateContactDto` (campos obrigatórios `name`/`phone`/`venue_name`/`address`/`email`/`role`, campos opcionais `alternate_phone`/`notes`, regex de telefone, formato de e-mail)
- [x] 5.2 Implementar `CreateContactDto` em `src/shared/communication/dtos/contact/create-contact.dto.ts`:
  - `phone`/`alternate_phone` (opcional): `@Matches(BRAZILIAN_PHONE_REGEX)`, reaproveitando a constante de `create-band-booking.dto.ts`
  - `name`/`venue_name`/`role`: `@IsString() @MinLength(1)`, mesmo padrão de `title`/`focal_point_name` em `create-band-booking.dto.ts`
  - `address`: `@IsString() @MinLength(1)`, idêntico ao campo `address` de `create-band-booking.dto.ts`
  - `email`: `@IsEmail() @MaxLength(254)`, mesmo padrão de `create-user.dto.ts`
  - `notes` (opcional): `@IsOptional() @IsString()`

## 6. Aplicação — Use Case

- [x] 6.1 Criar interface `CreateContactUseCaseInterface` em `src/application/usecase/contact/interfaces/create-contact.usecase.interface.ts` (`execute(userId, dto): Promise<void>`)
- [x] 6.2 Escrever teste unitário de `CreateContactUseCase` (fluxo de sucesso e propagação de erro do repositório)
- [x] 6.3 Implementar `CreateContactUseCase` em `src/application/usecase/contact/create-contact.usecase.ts` (constrói `ContactEntity` com `user_id` do usuário autenticado, chama `repository.save(contact)`)

## 7. HTTP — Controller e módulo

- [x] 7.1 Criar decorator Swagger `ApiCreateContact()` em `src/http/contact/decorators/create-contact.decorator.ts` (respostas 201/401/422/500)
- [x] 7.2 Escrever teste unitário de `ContactController` (delega para o use case, extrai `userId` do usuário autenticado)
- [x] 7.3 Implementar `ContactController` em `src/http/contact/contact.controller.ts` (`@Controller('users/contacts')`, `POST /`, `@UseGuards(JwtAuthGuard)`, injeta use case via token)
- [x] 7.4 Criar `ContactFactoryModule` em `src/http/contact/contact-factory.module.ts` (registra `ContactTypeormEntity` no `TypeOrmModule.forFeature`, provider do repositório, token `CREATE_CONTACT_USE_CASE`)
- [x] 7.5 Registrar `ContactFactoryModule` no módulo raiz da aplicação

## 8. Testes end-to-end

- [x] 8.1 Escrever `test/e2e/contact/create.e2e-spec.ts` cobrindo: criação com sucesso (só obrigatórios), criação com todos os campos (incluindo opcionais), 401 sem autenticação, 422 para ausência de cada campo obrigatório (`name`, `phone`, `venue_name`, `address`, `email`, `role`) e para telefone/e-mail em formato inválido, e verificação de que o contato criado tem `user_id` igual ao do usuário autenticado

## 9. Finalização

- [x] 9.1 Rodar `npm run test:cov` e garantir 100% de cobertura (statements, branches, functions, lines)
- [x] 9.2 Rodar `npm run test:e2e` e garantir que todos os testes passam
- [x] 9.3 Rodar lint/format (`npm run lint`) e corrigir eventuais problemas
- [x] 9.4 Atualizar a documentação Swagger/Scalar e revisar exemplos dos campos
