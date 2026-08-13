## Why

Bandas e usuários que organizam shows e eventos precisam manter um cadastro de contatos (donos de casas de show, produtores, técnicos, contratantes) para agilizar a comunicação na hora de fechar uma apresentação. Hoje o sistema não possui nenhum recurso para armazenar esses contatos, obrigando o usuário a gerenciá-los fora da plataforma.

## What Changes

- Novo recurso `Contact`, criado via `POST /users/contacts`, contendo: nome, telefone principal, nome da casa de show/evento, endereço, e-mail e função/cargo do contato como campos obrigatórios; telefone secundário e observações como campos opcionais.
- Todo contato criado é automaticamente vinculado ao usuário autenticado que o criou, através da coluna `user_id` diretamente na tabela `user_contacts` (relação 1:N — um usuário pode ter vários contatos, cada contato pertence a exatamente um usuário).
- Telefones seguem a mesma regra já usada em `create-band-booking.dto.ts` (10 ou 11 dígitos, somente números, sem formatação), aceitando tanto celular quanto fixo.
- **Sem relação com banda nesta primeira etapa** — o vínculo contato↔banda (quando um contato for selecionado em um cadastro de evento/booking) fica para uma mudança futura, sem nenhuma coluna ou tabela preparatória sendo criada agora.

## Capabilities

### New Capabilities
- `contact-management`: cadastro de contatos de shows e eventos, associados ao usuário que os criou (relação 1:N via tabela `user_contacts`).

### Modified Capabilities
(nenhuma — os requisitos de `user-management` não mudam; apenas ganha uma nova tabela filha associada)

## Impact

- **Banco de dados**: nova tabela `user_contacts`, com coluna `user_id` (FK obrigatória para `users`), via migration TypeORM.
- **API**: novo endpoint `POST /users/contacts`, protegido por `JwtAuthGuard` (usuário autenticado).
- **Código**: nova entidade de domínio `ContactEntity`, repositório `IContactRepository`/`ContactRepository`, use case `CreateContactUseCase`, DTO `CreateContactDto`, controller `ContactController`, `ContactFactoryModule`.
- **Sem impacto** em `UserEntity`/`BandEntity` existentes — a tabela `user_contacts` referencia `user_id` via FK, sem alterar a tabela `users`, e não possui nenhuma coluna relacionada a `bands` nesta mudança.
