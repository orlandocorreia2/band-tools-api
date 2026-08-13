## ADDED Requirements

### Requirement: Criação de contato
O sistema SHALL permitir que um usuário autenticado crie um contato de show/evento através de `POST /users/contacts`, informando nome, telefone principal, nome da casa de show/evento, endereço, e-mail e função/cargo como campos obrigatórios, e telefone secundário e observações como campos opcionais.

#### Scenario: Criação com todos os campos obrigatórios preenchidos
- **WHEN** um usuário autenticado envia `POST /users/contacts` com `name`, `phone`, `venue_name`, `address`, `email` e `role` válidos, sem os campos opcionais
- **THEN** o sistema SHALL criar o contato com sucesso (`201 Created`) e retornar os dados do contato criado

#### Scenario: Criação com todos os campos preenchidos, incluindo os opcionais
- **WHEN** um usuário autenticado envia `POST /users/contacts` com `name`, `phone`, `venue_name`, `address`, `email`, `role`, `alternate_phone` e `notes` válidos
- **THEN** o sistema SHALL criar o contato com sucesso (`201 Created`), persistindo todos os campos informados

#### Scenario: Requisição sem usuário autenticado
- **WHEN** uma requisição `POST /users/contacts` é feita sem um token JWT válido
- **THEN** o sistema SHALL rejeitar a requisição com `401 Unauthorized`

### Requirement: Validação dos campos do contato
O sistema SHALL validar os campos do contato antes da criação, rejeitando requisições com dados inválidos com `422 Unprocessable Entity`.

#### Scenario: Nome do contato ausente ou vazio
- **WHEN** um usuário autenticado envia `POST /users/contacts` sem o campo `name`, ou com `name` vazio
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que `name` é obrigatório

#### Scenario: Telefone principal ausente
- **WHEN** um usuário autenticado envia `POST /users/contacts` sem o campo `phone`
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que `phone` é obrigatório

#### Scenario: Telefone em formato inválido
- **WHEN** um usuário autenticado envia `POST /users/contacts` com `phone` ou `alternate_phone` contendo letras, símbolos, formatação ou uma quantidade de dígitos fora do intervalo de 10 a 11
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que o telefone é inválido

#### Scenario: Nome da casa de show/evento ausente ou vazio
- **WHEN** um usuário autenticado envia `POST /users/contacts` sem o campo `venue_name`, ou com `venue_name` vazio
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que `venue_name` é obrigatório

#### Scenario: Endereço ausente ou vazio
- **WHEN** um usuário autenticado envia `POST /users/contacts` sem o campo `address`, ou com `address` vazio
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que `address` é obrigatório

#### Scenario: E-mail ausente ou em formato inválido
- **WHEN** um usuário autenticado envia `POST /users/contacts` sem o campo `email`, ou com `email` em formato inválido
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que o e-mail é obrigatório e deve ser válido

#### Scenario: Função/cargo ausente ou vazio
- **WHEN** um usuário autenticado envia `POST /users/contacts` sem o campo `role`, ou com `role` vazio
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` indicando que `role` é obrigatório

### Requirement: Vínculo automático do contato ao usuário criador
Ao criar um contato, o sistema SHALL vincular automaticamente o contato ao usuário autenticado através da coluna `user_id`, em uma relação 1:N onde um usuário pode ter vários contatos, mas cada contato pertence a exatamente um usuário.

#### Scenario: Contato vinculado ao usuário que o criou
- **WHEN** um usuário autenticado cria um contato com sucesso
- **THEN** o sistema SHALL registrar `user_id` desse contato como o id do usuário autenticado, de forma que o contato passe a fazer parte da lista de contatos desse usuário

#### Scenario: Remoção do usuário remove seus contatos
- **WHEN** um usuário com um ou mais contatos vinculados é removido
- **THEN** o sistema SHALL remover automaticamente os contatos vinculados a esse usuário
