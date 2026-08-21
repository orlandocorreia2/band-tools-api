## ADDED Requirements

### Requirement: Listagem de contatos do usuário autenticado
O sistema SHALL permitir que um usuário autenticado liste todos os seus contatos através de `GET /users/contacts`, retornando apenas os contatos vinculados a esse usuário (`user_id`), ordenados do mais recente para o mais antigo.

#### Scenario: Listagem com contatos cadastrados
- **WHEN** um usuário autenticado que possui um ou mais contatos cadastrados envia `GET /users/contacts`
- **THEN** o sistema SHALL retornar `200 OK` com a lista de contatos pertencentes a esse usuário, ordenados do mais recente para o mais antigo

#### Scenario: Listagem sem contatos cadastrados
- **WHEN** um usuário autenticado que não possui nenhum contato cadastrado envia `GET /users/contacts`
- **THEN** o sistema SHALL retornar `200 OK` com uma lista vazia

#### Scenario: Isolamento entre usuários
- **WHEN** um usuário autenticado envia `GET /users/contacts` e existem contatos cadastrados por outros usuários
- **THEN** o sistema SHALL retornar somente os contatos cujo `user_id` seja o do usuário autenticado, sem incluir contatos de outros usuários

#### Scenario: Requisição sem usuário autenticado
- **WHEN** uma requisição `GET /users/contacts` é feita sem um token JWT válido
- **THEN** o sistema SHALL rejeitar a requisição com `401 Unauthorized`
