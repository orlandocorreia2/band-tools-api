## ADDED Requirements

### Requirement: Cadastro de setlist da banda
O sistema DEVE (SHALL) permitir o cadastro de um setlist para uma banda através de `POST /bands/:id/setlists`, com o seguinte campo:

**Campo obrigatório:**
- `name`: string, mínimo 1 caractere (nome do setlist)

Todas as validações DEVEM ser aplicadas via decorators do `class-validator` no DTO e documentadas via Swagger (`@ApiProperty`).

O setlist cadastrado DEVE ser persistido vinculado ao `band_id` informado na rota (`:id`).

#### Scenario: Cadastro com o campo obrigatório
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada contendo `name` preenchido
- **THEN** o sistema DEVE persistir o setlist vinculado à banda com um `id` gerado (UUIDv7), `created_at` e `updated_at` preenchidos automaticamente, e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com corpo malformado
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Cadastro sem o campo obrigatório
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada sem o campo `name` ou com `name` vazio
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `name`

### Requirement: Autenticação e vínculo do usuário com a banda no cadastro de setlist
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e realizar as seguintes verificações, nesta ordem, antes de persistir o setlist:

1. A banda referenciada pelo parâmetro `:id` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o setlist.
2. O usuário autenticado DEVE existir na tabela `users`; caso não exista, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o setlist.
3. O usuário autenticado DEVE ser membro da banda (DEVE existir um registro correspondente em `band_members` para o par banda/usuário); caso não seja, o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir o setlist.

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o setlist

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o setlist

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `:id`
- **THEN** o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir o setlist

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `POST /bands/:id/setlists` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401
