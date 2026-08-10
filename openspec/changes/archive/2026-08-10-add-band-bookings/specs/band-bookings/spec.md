## ADDED Requirements

### Requirement: Cadastro de agendamento de show/evento da banda
O sistema DEVE (SHALL) permitir o cadastro de um agendamento de show/evento para uma banda através de `POST /bands/:id/bookings`, com os seguintes campos:

**Campos obrigatórios:**
- `title`: string, mínimo 1 caractere (título do agendamento)
- `focal_point_name`: string, mínimo 1 caractere (nome do ponto focal responsável pelo contato)
- `phone`: string, somente dígitos, sem máscara — fixo (10 dígitos: DDD + 8 dígitos) ou celular (11 dígitos: DDD + 9 dígitos, com o dígito 9 na frente); o sistema DEVE (SHALL) rejeitar valores com formatação (parênteses, espaço ou hífen)
- `date`: string no formato ISO 8601 `YYYY-MM-DD` (data do agendamento)
- `start_time`: string no formato `HH:mm` (horário de início)
- `duration`: string, mínimo 1 caractere (duração do show, em texto livre; ex.: "1 hora", "40 minutos")
- `address`: string, mínimo 1 caractere (endereço do evento)
- `fee`: número entre `0` e `99999999.99` (cachê do show em reais; `0` representa show gratuito; o teto corresponde à capacidade máxima da coluna `numeric(10,2)` no banco)

**Campos opcionais:**
- `consumption`: string (texto livre descrevendo a consumação do local, quando houver; fica em branco caso não haja consumação)
- `link`: string, DEVE ser uma URL válida quando informado (link do evento/casa de show — Instagram, site ou outra página)
- `note`: string (observação livre)

O campo `status` (situação do agendamento) NÃO DEVE (SHALL NOT) ser aceito como input do cliente: todo agendamento DEVE (SHALL) ser criado com `status` igual a `Pending`, independentemente do que for enviado no corpo da requisição.

A combinação de `date` e `start_time` DEVE (SHALL) representar um instante futuro em relação ao momento do cadastro: se `date` for a data atual, `start_time` DEVE (SHALL) ser um horário ainda não alcançado; se `date` for anterior à data atual, o cadastro DEVE (SHALL) ser rejeitado independentemente de `start_time`.

Todas as validações de formato DEVEM ser aplicadas via decorators do `class-validator` no DTO e documentadas via Swagger (`@ApiProperty`).

O agendamento cadastrado DEVE ser persistido vinculado ao `band_id` informado na rota (`:id`).

#### Scenario: Cadastro com todos os campos obrigatórios preenchidos
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada contendo `title`, `focal_point_name`, `phone`, `date`, `start_time`, `duration`, `address` e `fee` preenchidos corretamente
- **THEN** o sistema DEVE persistir o agendamento vinculado à banda com um `id` gerado (UUIDv7), `status` igual a `Pending`, `created_at` e `updated_at` preenchidos automaticamente, e retornar HTTP 201 sem corpo

#### Scenario: Status informado pelo cliente é ignorado
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com um campo `status` no corpo (ex.: `"Confirmed"`), além dos campos válidos
- **THEN** o sistema DEVE descartar o valor de `status` recebido e persistir o agendamento com `status` igual a `Pending`

#### Scenario: Cadastro com show gratuito
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com todos os campos obrigatórios e `fee` igual a `0`
- **THEN** o sistema DEVE persistir o agendamento com `fee` igual a `0` e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com os campos opcionais preenchidos
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada contendo todos os campos obrigatórios e também `consumption`, `link` e `note` preenchidos
- **THEN** o sistema DEVE persistir o agendamento com `consumption`, `link` e `note` armazenados e retornar HTTP 201 sem corpo

#### Scenario: Cadastro sem os campos opcionais
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada contendo apenas os campos obrigatórios, sem `consumption`, `link` nem `note`
- **THEN** o sistema DEVE persistir o agendamento com `consumption`, `link` e `note` nulos e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com corpo malformado
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Cadastro sem um campo obrigatório
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada sem um dos campos `title`, `focal_point_name`, `phone`, `date`, `start_time`, `duration`, `address` ou `fee`, ou com algum deles vazio
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo faltante

#### Scenario: Cadastro com telefone em formato inválido
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `phone` em um formato que não corresponde a um telefone brasileiro válido (fixo ou celular)
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `phone`

#### Scenario: Cadastro com telefone contendo máscara
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `phone` formatado com parênteses, espaço ou hífen (ex.: `(11) 98765-4321`)
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `phone`

#### Scenario: Cadastro com cachê negativo
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `fee` menor que `0`
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `fee`

#### Scenario: Cadastro com cachê acima da capacidade suportada
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `fee` maior que `99999999.99`
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `fee`, e NÃO DEVE retornar HTTP 500

#### Scenario: Cadastro com cachê com mais de duas casas decimais
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `fee` contendo mais de duas casas decimais (ex.: `800.999`)
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `fee`, e NÃO DEVE arredondar o valor silenciosamente

#### Scenario: Cadastro com link em formato inválido
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `link` preenchido em um formato que não é uma URL válida
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `link`

#### Scenario: Cadastro com data anterior à data atual
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `date` anterior à data atual
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o problema, e NÃO DEVE persistir o agendamento

#### Scenario: Cadastro com data atual e horário já passado
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `date` igual à data atual e `start_time` anterior ao horário atual
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o problema, e NÃO DEVE persistir o agendamento

#### Scenario: Cadastro com data atual e horário futuro
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `date` igual à data atual e `start_time` posterior ao horário atual
- **THEN** o sistema DEVE persistir o agendamento e retornar HTTP 201 sem corpo

### Requirement: Autenticação e vínculo do usuário com a banda no cadastro de agendamento
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e realizar as seguintes verificações, nesta ordem, antes de persistir o agendamento:

1. A banda referenciada pelo parâmetro `:id` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento.
2. O usuário autenticado DEVE existir na tabela `users`; caso não exista, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento.
3. O usuário autenticado DEVE ser membro da banda (DEVE existir um registro correspondente em `band_members` para o par banda/usuário); caso não seja, o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir o agendamento.

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `:id`
- **THEN** o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir o agendamento

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401
