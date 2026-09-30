# band-bookings Specification

## Purpose
TBD - created by archiving change add-band-bookings. Update Purpose after archive.
## Requirements
### Requirement: Cadastro de agendamento de show/evento da banda
O sistema DEVE (SHALL) permitir o cadastro de um agendamento de show/evento para uma banda através de `POST /bands/:id/bookings`, com os seguintes campos:

**Campos obrigatórios:**
- `title`: string, mínimo 1 caractere (título do agendamento)
- `contact_id`: string, UUID válido, identificando um contato previamente cadastrado pelo usuário autenticado (`POST /users/contacts`) a ser usado como ponto focal do agendamento
- `date`: string no formato ISO 8601 `YYYY-MM-DD` (data do agendamento)
- `start_time`: string no formato `HH:mm` (horário de início)
- `duration`: string, mínimo 1 caractere (duração do show, em texto livre; ex.: "1 hora", "40 minutos")
- `fee`: número entre `0` e `99999999.99` (cachê do show em reais; `0` representa show gratuito; o teto corresponde à capacidade máxima da coluna `numeric(10,2)` no banco)

**Campos opcionais:**
- `consumption`: string (texto livre descrevendo a consumação do local, quando houver; fica em branco caso não haja consumação)
- `link`: string, DEVE ser uma URL válida quando informado (link do evento/casa de show — Instagram, site ou outra página)
- `note`: string (observação livre)

O campo `status` (situação do agendamento) NÃO DEVE (SHALL NOT) ser aceito como input do cliente: todo agendamento DEVE (SHALL) ser criado com `status` igual a `Pending`, independentemente do que for enviado no corpo da requisição.

A combinação de `date` e `start_time` DEVE (SHALL) representar um instante futuro em relação ao momento do cadastro: se `date` for a data atual, `start_time` DEVE (SHALL) ser um horário ainda não alcançado; se `date` for anterior à data atual, o cadastro DEVE (SHALL) ser rejeitado independentemente de `start_time`.

Todas as validações de formato DEVEM ser aplicadas via decorators do `class-validator` no DTO e documentadas via Swagger (`@ApiProperty`).

O agendamento cadastrado DEVE ser persistido vinculado ao `band_id` informado na rota (`:id`) e ao `contact_id` informado no corpo da requisição, e NÃO DEVE armazenar nome, telefone ou endereço do contato como colunas próprias — esses dados passam a ser lidos exclusivamente a partir do contato referenciado.

#### Scenario: Cadastro com todos os campos obrigatórios preenchidos
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada contendo `title`, `contact_id`, `date`, `start_time`, `duration` e `fee` preenchidos corretamente, referenciando um contato existente e pertencente ao usuário autenticado
- **THEN** o sistema DEVE persistir o agendamento vinculado à banda e ao contato com um `id` gerado (UUIDv7), `status` igual a `Pending`, `created_at` e `updated_at` preenchidos automaticamente, e retornar HTTP 201 sem corpo

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
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada sem um dos campos `title`, `contact_id`, `date`, `start_time`, `duration` ou `fee`, ou com algum deles vazio
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo faltante

#### Scenario: Cadastro com contact_id em formato inválido
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada com `contact_id` que não é um UUID válido
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `contact_id`

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
4. O `contact_id` informado DEVE corresponder a um contato existente em `user_contacts` cujo `user_id` seja o do usuário autenticado; caso o contato não exista ou pertença a outro usuário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento, sem revelar se o `contact_id` corresponde a um contato de outro usuário.

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

#### Scenario: Contato referenciado não existe
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada por um usuário autenticado e membro da banda, com `contact_id` que não corresponde a nenhum contato cadastrado
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento

#### Scenario: Contato referenciado pertence a outro usuário
- **WHEN** uma requisição `POST /bands/:id/bookings` é enviada por um usuário autenticado e membro da banda, com `contact_id` correspondente a um contato existente cujo `user_id` é de outro usuário
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o agendamento

### Requirement: Listagem de agendamentos da banda
O sistema DEVE (SHALL) permitir que um membro da banda liste todos os agendamentos dessa banda através de `GET /bands/:id/bookings`, retornando HTTP 200 com um objeto JSON no formato `{ "data": [...] }`.

`data` DEVE (SHALL) conter somente os agendamentos cujo `band_id` seja o `:id` da rota, de qualquer `status` (`Pending`, `Confirmed`, `Cancelled`) e incluindo agendamentos com data já passada.

Cada item de `data` DEVE (SHALL) conter:
- `id`, `title`, `start_time`, `duration`, `status`, `created_at` e `updated_at` do agendamento;
- `date` no formato `YYYY-MM-DD`;
- `fee` como número;
- `consumption`, `link` e `note`, com valor `null` quando não preenchidos (a chave DEVE estar sempre presente);
- `contact`: objeto com os dados do contato referenciado pelo agendamento, com os campos `id`, `name`, `phone`, `alternate_phone`, `venue_name`, `address`, `email`, `role` e `notes`. `alternate_phone` e `notes` DEVEM vir como `null` quando não preenchidos.

O item NÃO DEVE (SHALL NOT) expor `band_id`, porque ele já é o `:id` da rota, nem `contact_id`, porque ele já é o `contact.id`.

O objeto `contact` NÃO DEVE (SHALL NOT) expor `user_id`, `created_at` nem `updated_at` do contato.

Os itens DEVEM (SHALL) ser ordenados em ordem cronológica: `date` ascendente e, na mesma data, `start_time` ascendente.

O endpoint NÃO DEVE (SHALL NOT) ser paginado nesta versão.

#### Scenario: Listagem com agendamentos cadastrados
- **WHEN** um membro autenticado envia `GET /bands/:id/bookings` para uma banda que possui agendamentos
- **THEN** o sistema DEVE retornar HTTP 200 com `data` contendo todos os agendamentos da banda, cada um com os campos do agendamento e o objeto `contact` preenchido com os dados do contato referenciado, sem `band_id` e `contact_id` no item e sem `created_at` e `updated_at` no `contact`

#### Scenario: Listagem sem agendamentos cadastrados
- **WHEN** um membro autenticado envia `GET /bands/:id/bookings` para uma banda que não possui agendamentos
- **THEN** o sistema DEVE retornar HTTP 200 com `{ "data": [] }`

#### Scenario: Ordenação cronológica
- **WHEN** a banda possui agendamentos em datas diferentes e mais de um agendamento na mesma data com `start_time` diferentes, cadastrados fora de ordem
- **THEN** o sistema DEVE retornar os itens ordenados por `date` ascendente e, na mesma data, por `start_time` ascendente

#### Scenario: Isolamento entre bandas
- **WHEN** um membro autenticado envia `GET /bands/:id/bookings` e existem agendamentos cadastrados para outras bandas
- **THEN** o sistema DEVE retornar somente os agendamentos da banda informada no `:id` da rota

#### Scenario: Campos opcionais não preenchidos
- **WHEN** a banda possui um agendamento cadastrado sem `consumption`, `link` e `note`
- **THEN** o item correspondente DEVE conter as chaves `consumption`, `link` e `note` com valor `null`

#### Scenario: Formato de data e cachê
- **WHEN** a banda possui um agendamento cadastrado com `date` `2026-12-20` e `fee` `800.5`
- **THEN** o item correspondente DEVE conter `date` igual a `"2026-12-20"` e `fee` igual ao número `800.5`

#### Scenario: Contato cadastrado por outro membro da banda
- **WHEN** um membro autenticado lista os agendamentos e um deles foi cadastrado por outro membro da mesma banda, usando um contato desse outro membro
- **THEN** o item correspondente DEVE conter o objeto `contact` com os dados desse contato, sem o campo `user_id`

#### Scenario: Status diferente de Pending
- **WHEN** a banda possui um agendamento com `status` `Confirmed` ou `Cancelled`
- **THEN** o item correspondente DEVE ser retornado com o `status` persistido, e NÃO DEVE ser normalizado para `Pending`

### Requirement: Autenticação e vínculo do usuário com a banda na listagem de agendamentos
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e aplicar as mesmas verificações do cadastro de agendamento, nesta ordem, antes de retornar qualquer dado:

1. O parâmetro `:id` DEVE ser um UUID v7 válido; caso contrário, o sistema DEVE retornar HTTP 422.
2. A banda referenciada por `:id` DEVE existir; caso contrário, o sistema DEVE retornar HTTP 404.
3. O usuário autenticado DEVE existir; caso contrário, o sistema DEVE retornar HTTP 404.
4. O usuário autenticado DEVE ser membro da banda; caso contrário, o sistema DEVE retornar HTTP 403.

Em nenhum desses casos a resposta DEVE conter dados de agendamentos ou contatos.

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `GET /bands/:id/bookings` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401

#### Scenario: Id da banda em formato inválido
- **WHEN** uma requisição `GET /bands/:id/bookings` é enviada com `:id` que não é um UUID v7 válido
- **THEN** o sistema DEVE retornar HTTP 422 com erro identificando o campo `id`

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `GET /bands/:id/bookings` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `GET /bands/:id/bookings` é enviada com um JWT válido cujo `sub` não corresponde a nenhum usuário
- **THEN** o sistema DEVE retornar HTTP 404

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `GET /bands/:id/bookings` é enviada por um usuário autenticado e existente, mas que não é membro da banda informada
- **THEN** o sistema DEVE retornar HTTP 403 e NÃO DEVE retornar agendamentos nem contatos da banda
