## 1. Domain

- [x] 1.1 Adicionar `findAllByUserId(userId: string): Promise<ContactEntity[]>` em `src/domain/repositories/contact/contact.repository.interface.ts`

## 2. Infrastructure

- [x] 2.1 Escrever teste unitário (red) para `ContactRepository.findAllByUserId` em `test/unit/infrastructure/repository/contact/contact.repository.spec.ts`, cobrindo: retorno da lista ordenada por `created_at` DESC e filtro por `user_id`
- [x] 2.2 Implementar `findAllByUserId` em `src/infrastructure/repository/contact/contact.repository.ts` usando `repository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } })` (green)

## 3. Application (Use Case)

- [x] 3.1 Criar `src/application/usecase/contact/interfaces/list-contacts-by-user.usecase.interface.ts` (`execute(userId: string): Promise<ContactEntity[]>`) e expor no `interfaces/index.ts`
- [x] 3.2 Escrever teste unitário (red) para `ListContactsByUserUseCase` em `test/unit/application/usecase/contact/list-contacts-by-user.usecase.spec.ts`, cobrindo delegação ao repositório com o `userId` recebido
- [x] 3.3 Implementar `src/application/usecase/contact/list-contacts-by-user.usecase.ts` (green)

## 4. Shared DTOs

- [x] 4.1 Escrever teste unitário (red) para `ContactResponseDto.fromEntity`/`fromEntities` em `test/unit/shared/communication/dtos/contact/contact-response.dto.spec.ts`
- [x] 4.2 Criar `src/shared/communication/dtos/contact/contact-response.dto.ts` (campos: `id`, `name`, `phone`, `alternate_phone`, `venue_name`, `address`, `email`, `role`, `notes`, `created_at`, `updated_at`) (green)
- [x] 4.3 Escrever teste unitário (red) para `ListContactsResponseDto.fromEntities` em `test/unit/shared/communication/dtos/contact/list-contacts-response.dto.spec.ts`
- [x] 4.4 Criar `src/shared/communication/dtos/contact/list-contacts-response.dto.ts` (campo `data: ContactResponseDto[]`) (green)

## 5. HTTP Layer

- [x] 5.1 Criar `src/http/contact/decorators/list-contacts.decorator.ts` (`ApiListContacts()`) documentando `200` (`ListContactsResponseDto`) e `401`
- [x] 5.2 Atualizar `src/http/contact/contact-factory.module.ts`: adicionar `LIST_CONTACTS_BY_USER_USE_CASE` ao wiring, injetando `ContactRepository`
- [x] 5.3 Escrever teste unitário (red) para o novo endpoint em `test/unit/http/contact/contact.controller.spec.ts`, cobrindo chamada ao use case com `request.user.id` e retorno via `ListContactsResponseDto.fromEntities`
- [x] 5.4 Implementar `GET /users/contacts` em `src/http/contact/contact.controller.ts` (método `list`, `@ApiListContacts()`, `@Get()`) (green)
- [x] 5.5 Atualizar teste unitário de `test/unit/http/contact/contact-factory.module.spec.ts` para cobrir o novo provider

## 6. Testes e2e

- [x] 6.1 Criar `test/e2e/contact/list.e2e-spec.ts` cobrindo os cenários da spec: listagem com contatos, listagem vazia, isolamento entre usuários e requisição sem token (`401`)

## 7. Finalização

- [x] 7.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements/branches/functions/lines) nos arquivos novos/alterados
- [x] 7.2 Rodar `npm run test:e2e` e confirmar que todos os cenários passam
- [x] 7.3 Rodar lint/format (`npm run lint`) e revisar Object Calisthenics nos arquivos novos
