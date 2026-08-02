## MODIFIED Requirements

### Requirement: Cadastro de música no repertório da banda
O sistema DEVE (SHALL) permitir o cadastro de uma música no repertório de uma banda através de `POST /bands/:id/songs`, com os seguintes campos:

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
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada contendo somente `title` preenchido
- **THEN** o sistema DEVE persistir a música vinculada à banda com um `id` gerado (UUIDv7), `created_at` e `updated_at` preenchidos automaticamente, e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com todos os campos preenchidos
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada com `title`, `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` preenchidos corretamente
- **THEN** o sistema DEVE persistir a música com todos os valores informados e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com corpo malformado
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Cadastro sem o campo obrigatório
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada sem o campo `title` ou com `title` vazio
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `title`

#### Scenario: Cadastro com bpm inválido
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada com `bpm` que não seja um número inteiro positivo
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

#### Scenario: Cadastro com duration inválido
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada com `duration` que não seja um número inteiro positivo
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

### Requirement: Autenticação e vínculo do usuário com a banda no cadastro de música
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e realizar as seguintes verificações, nesta ordem, antes de persistir a música:

1. A banda referenciada pelo parâmetro `:id` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música.
2. O usuário autenticado DEVE existir na tabela `users` (o token pode ser válido, mas o usuário pode ter sido removido da base); caso não exista, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música.
3. O usuário autenticado DEVE ser membro da banda (DEVE existir um registro correspondente em `band_members` para o par banda/usuário); caso não seja, o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir a música.

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir a música

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `:id`
- **THEN** o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir a música

#### Scenario: Usuário autenticado é membro da banda
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada por um usuário autenticado, existente, e que possui vínculo em `band_members` com a banda informada em `:id`, com `title` preenchido
- **THEN** o sistema DEVE persistir a música e retornar HTTP 201 sem corpo

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `POST /bands/:id/songs` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401

## ADDED Requirements

### Requirement: Listagem de músicas do repertório da banda

O sistema DEVE (SHALL) permitir que um usuário autenticado liste todas as músicas do repertório de uma banda através de `GET /bands/{bandId}/songs`, protegido por `JwtAuthGuard`.

O sistema DEVE (SHALL) reutilizar as mesmas verificações já aplicadas ao cadastro de música no repertório, nesta ordem, antes de retornar a listagem:

1. A banda referenciada por `{bandId}` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404.
2. O usuário autenticado DEVE existir na tabela `users`; caso não exista, o sistema DEVE retornar HTTP 404.
3. O usuário autenticado DEVE ser membro da banda (registro correspondente em `band_members`); caso não seja, o sistema DEVE retornar HTTP 403.

A resposta NÃO DEVE (SHALL NOT) ser paginada: o sistema DEVE (SHALL) retornar o conjunto completo de músicas do repertório da banda em uma única resposta. O corpo da resposta DEVE (SHALL) seguir o formato de envelope `{ "data": [...] }`: o array de músicas DEVE (SHALL) estar contido na chave `data`, com as informações de cada música (`id`, `band_id`, `title`, `tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes`, `created_at`, `updated_at`), e não retornado como um array solto na raiz do corpo.

#### Scenario: Banda com múltiplas músicas no repertório

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada por um usuário autenticado e membro da banda, e a banda possui três músicas cadastradas no repertório
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [...] }` cuja chave `data` contém um array com as três músicas e suas informações

#### Scenario: Banda sem nenhuma música no repertório

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada por um usuário autenticado e membro da banda que não possui nenhuma música cadastrada no repertório
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [] }`, ou seja, a chave `data` contendo um array vazio

#### Scenario: Resultado exclui músicas de outras bandas

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada por um usuário autenticado e membro da banda, e existem músicas no sistema pertencentes apenas a outras bandas
- **THEN** o sistema NÃO DEVE incluir essas músicas no array contido na chave `data` da resposta

#### Scenario: Banda informada não existe

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada com um `{bandId}` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP status 404

#### Scenario: Usuário autenticado não existe mais na base

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP status 404

#### Scenario: Usuário autenticado não é membro da banda

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `{bandId}`
- **THEN** o sistema DEVE retornar HTTP status 403

#### Scenario: Requisição sem autenticação

- **WHEN** uma requisição `GET /bands/{bandId}/songs` é enviada sem um JWT válido (ausente, malformado ou expirado)
- **THEN** o sistema DEVE retornar HTTP status 401 e NÃO DEVE retornar nenhuma música
