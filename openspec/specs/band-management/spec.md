# band-management Specification

## Purpose
TBD - created by archiving change band-member-ownership. Update Purpose after archive.
## Requirements
### Requirement: Create band
The system SHALL allow registering a new band with the following fields and validations:

**Required fields:**
- `name`: string, minimum 3 characters
- `genre`: free-form string, minimum 1 character (no fixed catalog/enum)
- `state`: string, minimum 1 character
- `city`: string, minimum 1 character
- `neighborhood`: string, minimum 1 character
- `address`: string, minimum 1 character
- `started_at`: valid date
- `status`: must be a valid `BandStatusEnum` value

**Optional fields:**
- `description`: string
- `image`: string (URL)

All validations SHALL be enforced via `class-validator` decorators on the DTO and documented via Swagger (`@ApiProperty`).

The system SHALL identify the authenticated user making the request (from the JWT payload attached by `JwtAuthGuard`) and SHALL verify that this user still exists in the `users` table before creating the band. If the user cannot be found, the system SHALL return HTTP status 404 and SHALL NOT persist the band. If the user exists, the system SHALL, in the same database transaction as the band creation, create a corresponding `band_members` record linking that user to the newly created band with `is_owner = true`. If the membership record cannot be created, the band creation SHALL be rolled back as well.

#### Scenario: Registration with all valid data
- **WHEN** a `POST /bands` request is sent with all required fields passing their validations
- **THEN** the system SHALL persist the band with a generated `id` (UUIDv7), `created_at` and `updated_at` filled automatically, and return HTTP status 201 with no body

#### Scenario: Registration with malformed request body
- **WHEN** a `POST /bands` request is sent with an unparseable body (e.g. invalid JSON)
- **THEN** the system SHALL return HTTP status 400

#### Scenario: Registration without a required field
- **WHEN** a `POST /bands` request is sent with any required field missing
- **THEN** the system SHALL return HTTP status 422 with an error message identifying the missing field

#### Scenario: Registration with name shorter than 3 characters
- **WHEN** a `POST /bands` request is sent with `name` containing fewer than 3 characters
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Registration with missing genre
- **WHEN** a `POST /bands` request is sent with `genre` missing or empty
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Registration with invalid status
- **WHEN** a `POST /bands` request is sent with a `status` outside the allowed `BandStatusEnum` values
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Registration with invalid started_at
- **WHEN** a `POST /bands` request is sent with `started_at` that is not a valid date
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Authenticated user is automatically linked as owner
- **WHEN** a `POST /bands` request is sent by an authenticated user (valid JWT) with all required fields passing their validations
- **THEN** the system SHALL create a `band_members` record with the authenticated user's `id`, the newly created band's `id`, and `is_owner = true`

#### Scenario: Membership creation failure rolls back the band
- **WHEN** a `POST /bands` request passes all validations but the `band_members` insert fails for any reason
- **THEN** the system SHALL NOT persist the band either, returning HTTP status 500

#### Scenario: Authenticated user no longer exists
- **WHEN** a `POST /bands` request is sent with a structurally valid JWT (correct signature, not expired) whose subject (`sub`) no longer matches any record in `users`
- **THEN** the system SHALL return HTTP status 404 and SHALL NOT persist the band

### Requirement: Listar bandas do usuário autenticado

O sistema DEVE (SHALL) permitir que um usuário autenticado liste todas as bandas às quais pertence via `GET /bands`, protegido pelo `JwtAuthGuard`.

O sistema DEVE (SHALL) identificar o usuário autenticado a partir do payload do JWT anexado pelo `JwtAuthGuard` e DEVE (SHALL) filtrar as bandas pelo `id` desse usuário, usando o relacionamento já existente em `band_members` (coluna `user_id`). Uma banda DEVE (SHALL) ser incluída no resultado sempre que um registro em `band_members` vincular essa banda ao usuário autenticado, independentemente de esse registro ter `is_owner = true` (criador) ou `is_owner = false` (membro comum) — ambos os casos representam bandas às quais o usuário "pertence".

A resposta NÃO DEVE (SHALL NOT) ser paginada: o sistema DEVE (SHALL) retornar o conjunto completo de bandas correspondentes em uma única resposta. O corpo da resposta DEVE (SHALL) seguir o formato de envelope `{ "data": [...] }`: o array de bandas DEVE (SHALL) estar contido na chave `data`, e não retornado como um array solto na raiz do corpo.

#### Scenario: Usuário com múltiplas bandas (próprias e das quais participa)

- **WHEN** uma requisição `GET /bands` é enviada por um usuário autenticado que possui registros em `band_members` para três bandas, sendo um com `is_owner = true` e dois com `is_owner = false`
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [...] }` cuja chave `data` contém um array com as três bandas

#### Scenario: Usuário sem nenhuma banda

- **WHEN** uma requisição `GET /bands` é enviada por um usuário autenticado que não possui nenhum registro em `band_members` para nenhuma banda
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [] }`, ou seja, a chave `data` contendo um array vazio

#### Scenario: Requisição sem autenticação

- **WHEN** uma requisição `GET /bands` é enviada sem um JWT válido (ausente, malformado ou expirado)
- **THEN** o sistema DEVE retornar HTTP status 401 e NÃO DEVE retornar nenhum dado de banda

#### Scenario: Resultado exclui bandas de outros usuários

- **WHEN** uma requisição `GET /bands` é enviada por um usuário autenticado, e existem bandas no sistema que pertencem apenas a outros usuários (sem registro em `band_members` para o usuário solicitante)
- **THEN** o sistema NÃO DEVE incluir essas bandas no array contido na chave `data` da resposta
