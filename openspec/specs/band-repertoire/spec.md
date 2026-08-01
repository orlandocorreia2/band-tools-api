# band-repertoire Specification

## Purpose
TBD - created by archiving change band-song-repertoire. Update Purpose after archive.
## Requirements
### Requirement: Cadastro de música no repertório da banda
O sistema DEVE (SHALL) permitir o cadastro de uma música no repertório de uma banda através de `POST /bands/:id/song`, com os seguintes campos:

**Campo obrigatório:**
- `title`: string, mínimo 1 caractere (título da música)

**Campos opcionais:**
- `tuning`: string (afinação da música)
- `tonality`: string (tonalidade da música)
- `bpm`: número inteiro positivo (batidas por minuto)
- `duration`: número inteiro positivo (tempo total da música, em segundos)
- `lyrics`: string (letra da música)
- `notes`: string (observação da música)

Todas as validações DEVEM ser aplicadas via decorators do `class-validator` no DTO e documentadas via Swagger (`@ApiProperty`).

A música cadastrada DEVE ser persistida vinculada ao `band_id` informado na rota (`:id`).

#### Scenario: Cadastro com apenas o campo obrigatório
- **WHEN** uma requisição `POST /bands/:id/song` é enviada contendo somente `title` preenchido
- **THEN** o sistema DEVE persistir a música vinculada à banda com um `id` gerado (UUIDv7), `created_at` e `updated_at` preenchidos automaticamente, e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com todos os campos preenchidos
- **WHEN** uma requisição `POST /bands/:id/song` é enviada com `title`, `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` preenchidos corretamente
- **THEN** o sistema DEVE persistir a música com todos os valores informados e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com corpo malformado
- **WHEN** uma requisição `POST /bands/:id/song` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Cadastro sem o campo obrigatório
- **WHEN** uma requisição `POST /bands/:id/song` é enviada sem o campo `title` ou com `title` vazio
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `title`

#### Scenario: Cadastro com bpm inválido
- **WHEN** uma requisição `POST /bands/:id/song` é enviada com `bpm` que não seja um número inteiro positivo
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com duration inválido
- **WHEN** uma requisição `POST /bands/:id/song` é enviada com `duration` que não seja um número inteiro positivo
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

### Requirement: Autenticação e vínculo do usuário com a banda no cadastro de música
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e realizar as seguintes verificações, nesta ordem, antes de persistir a música:

1. A banda referenciada pelo parâmetro `:id` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música.
2. O usuário autenticado DEVE existir na tabela `users` (o token pode ser válido, mas o usuário pode ter sido removido da base); caso não exista, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música.
3. O usuário autenticado DEVE ser membro da banda (DEVE existir um registro correspondente em `band_members` para o par banda/usuário); caso não seja, o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir a música.

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `POST /bands/:id/song` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `POST /bands/:id/song` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `POST /bands/:id/song` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `:id`
- **THEN** o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir a música

#### Scenario: Usuário autenticado é membro da banda
- **WHEN** uma requisição `POST /bands/:id/song` é enviada por um usuário autenticado, existente, e que possui vínculo em `band_members` com a banda informada em `:id`, com `title` preenchido
- **THEN** o sistema DEVE persistir a música e retornar HTTP 201 sem corpo

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `POST /bands/:id/song` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401
