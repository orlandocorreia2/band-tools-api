# user-management Specification

## Purpose
TBD - created by archiving change user-registration. Update Purpose after archive.
## Requirements
### Requirement: Cadastrar usuário
O sistema DEVE (SHALL) permitir o cadastro de um novo usuário com os seguintes campos e validações:

**Campos obrigatórios:**
- `first_name`: string, entre 2 e 100 caracteres
- `last_name`: string, entre 2 e 100 caracteres
- `email`: endereço de e-mail válido, único, no máximo 254 caracteres
- `phone`: string, entre 8 e 11 caracteres, apenas dígitos locais (DDD + número, sem `+55` ou outro prefixo de país) — apenas dado de contato, sem restrição de unicidade
- `password`: string, entre 8 e 72 caracteres (limite real de bytes processados pelo `bcrypt`), contendo ao menos uma letra e um número

O campo `avatar` existe no modelo de dados do usuário (armazenado como `text`, sem limite de tamanho), mas NÃO é aceito nesta requisição de cadastro — permanece nulo até que uma mudança futura implemente seu preenchimento.

Todas as validações DEVEM ser aplicadas via decorators do `class-validator` no DTO e documentadas via Swagger (`@ApiProperty`). A senha DEVE ser transformada em hash (via `bcrypt`, com custo configurável pela variável de ambiente `BCRYPT_SALT_ROUNDS`) antes de ser persistida, e nunca DEVE ser retornada em nenhuma resposta da API.

#### Scenario: Cadastro com todos os dados válidos
- **WHEN** uma requisição `POST /users` é enviada com todos os campos obrigatórios válidos
- **THEN** o sistema DEVE persistir o usuário com um `id` gerado (UUIDv7), `created_at` e `updated_at` preenchidos automaticamente, a senha armazenada como hash, e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com corpo de requisição malformado
- **WHEN** uma requisição `POST /users` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Cadastro sem um campo obrigatório
- **WHEN** uma requisição `POST /users` é enviada com qualquer campo obrigatório ausente
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo ausente

#### Scenario: Cadastro com e-mail em formato inválido
- **WHEN** uma requisição `POST /users` é enviada com `email` em um formato inválido
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com e-mail já existente
- **WHEN** uma requisição `POST /users` é enviada com um `email` que já pertence a outro usuário cadastrado
- **THEN** o sistema DEVE retornar HTTP 409 sem criar um novo registro

#### Scenario: Cadastro com senha fraca
- **WHEN** uma requisição `POST /users` é enviada com `password` contendo menos de 8 caracteres, ou sem ao menos uma letra e um número
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com nome ou sobrenome muito curtos
- **WHEN** uma requisição `POST /users` é enviada com `first_name` ou `last_name` contendo menos de 2 caracteres
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com telefone maior que 11 caracteres
- **WHEN** uma requisição `POST /users` é enviada com `phone` contendo mais de 11 caracteres (ex.: incluindo `+55`)
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com nome, sobrenome ou e-mail muito longos
- **WHEN** uma requisição `POST /users` é enviada com `first_name` ou `last_name` contendo mais de 100 caracteres, ou `email` contendo mais de 254 caracteres
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com senha maior que 72 caracteres
- **WHEN** uma requisição `POST /users` é enviada com `password` contendo mais de 72 caracteres
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

