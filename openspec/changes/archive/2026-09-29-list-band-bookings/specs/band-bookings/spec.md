## ADDED Requirements

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
