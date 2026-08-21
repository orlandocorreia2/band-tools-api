## Why

Atualmente o usuário autenticado pode criar contatos (`POST /users/contacts`), mas não existe nenhuma forma de consultar os contatos já cadastrados. Sem um endpoint de listagem, os contatos ficam inacessíveis após a criação, o que torna a funcionalidade incompleta para o caso de uso real (agenda de contatos de shows/eventos).

## What Changes

- Adicionar endpoint `GET /users/contacts` que retorna todos os contatos pertencentes ao usuário autenticado.
- A listagem SHALL ser restrita aos contatos cujo `user_id` corresponda ao usuário autenticado (identificado via JWT), nunca a contatos de outros usuários — segue o mesmo modelo de autorização já usado em `GET /bands` (filtragem por dono no servidor, nunca por parâmetro vindo do cliente).
- Reaproveitar o `ContactController`, `ContactFactoryModule`, `IContactRepository` e `ContactEntity` já existentes, seguindo o mesmo padrão de `ListBandsByUserUseCase` (use case dedicado + repositório com método `findAllByUserId`).
- Adicionar DTOs de resposta (`ContactResponseDto`, `ListContactsResponseDto`) seguindo o padrão de `BandResponseDto` / `ListBandsResponseDto`.

## Capabilities

### New Capabilities

_Nenhuma — reaproveita a capability existente `contact-management`._

### Modified Capabilities

- `contact-management`: adiciona o requisito de listagem dos contatos do usuário autenticado (`GET /users/contacts`), incluindo a regra de que cada usuário só pode visualizar seus próprios contatos.

## Impact

- **Código afetado**:
  - `src/domain/repositories/contact/contact.repository.interface.ts` — novo método `findAllByUserId(userId: string): Promise<ContactEntity[]>`
  - `src/infrastructure/repository/contact/contact.repository.ts` — implementação do novo método
  - `src/application/usecase/contact/` — novo `ListContactsByUserUseCase` + interface
  - `src/http/contact/contact.controller.ts` — novo endpoint `GET /users/contacts`
  - `src/http/contact/contact-factory.module.ts` — wiring do novo use case
  - `src/http/contact/decorators/` — novo `ApiListContacts()`
  - `src/shared/communication/dtos/contact/` — novos `ContactResponseDto` e `ListContactsResponseDto`
- **API**: novo endpoint `GET /users/contacts`, protegido por `JwtAuthGuard` (mesmo padrão de `GET /bands`).
- **Banco de dados**: nenhuma alteração de schema — reutiliza a tabela `user_contacts` já existente.
- **Testes**: novos testes unitários (use case, repositório, DTOs) e e2e (`test/`) cobrindo listagem, isolamento entre usuários e ausência de autenticação.
