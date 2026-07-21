## ADDED Requirements

### Requirement: Login com e-mail e senha
O sistema DEVE (SHALL) permitir que um usuário previamente cadastrado se autentique enviando `email` e `password` para `POST /auth/login`.

**Campos obrigatórios:**
- `email`: endereço de e-mail no formato válido
- `password`: string não vazia

O sistema DEVE localizar o usuário pelo `email` informado e comparar a `password` recebida contra o hash `bcrypt` armazenado na coluna `password` da tabela `users` (utilizando a mesma abstração `IPasswordHasher` usada no cadastro). Em nenhuma hipótese a senha em texto plano ou o hash armazenado DEVEM ser incluídos em qualquer resposta da API ou log.

#### Scenario: Login com credenciais válidas
- **WHEN** uma requisição `POST /auth/login` é enviada com `email` de um usuário cadastrado e a `password` correta correspondente ao hash armazenado
- **THEN** o sistema DEVE retornar HTTP 200 com um corpo contendo `accessToken` (JWT assinado, em camelCase)

#### Scenario: Login com e-mail inexistente
- **WHEN** uma requisição `POST /auth/login` é enviada com um `email` que não corresponde a nenhum usuário cadastrado
- **THEN** o sistema DEVE retornar HTTP 401 com uma mensagem de erro genérica, sem indicar que o e-mail não existe

#### Scenario: Login com senha incorreta
- **WHEN** uma requisição `POST /auth/login` é enviada com `email` de um usuário cadastrado, mas `password` que não corresponde ao hash armazenado
- **THEN** o sistema DEVE retornar HTTP 401 com uma mensagem de erro genérica, sem indicar que o e-mail existe

#### Scenario: Login com corpo de requisição malformado
- **WHEN** uma requisição `POST /auth/login` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Login sem um campo obrigatório
- **WHEN** uma requisição `POST /auth/login` é enviada sem `email` ou sem `password`
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo ausente

#### Scenario: Login com e-mail em formato inválido
- **WHEN** uma requisição `POST /auth/login` é enviada com `email` em um formato inválido
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro de validação

### Requirement: Proteção de rotas via guard de autenticação
O sistema DEVE (SHALL) fornecer um `JwtAuthGuard`, implementando `CanActivate`, que pode ser adicionado explicitamente a qualquer rota (via `@UseGuards(JwtAuthGuard)`) para exigir um token JWT válido. Rotas sem o guard adicionado permanecem públicas — o guard NÃO é aplicado globalmente.

O guard DEVE extrair o token do header `Authorization` no formato `Bearer <token>`, validar sua assinatura e expiração, e, em caso de sucesso, anexar as informações do usuário autenticado (`id`, `email`) à requisição para uso posterior pelo controller.

#### Scenario: Acesso a rota protegida com token válido
- **WHEN** uma requisição é enviada a uma rota decorada com `@UseGuards(JwtAuthGuard)`, contendo o header `Authorization: Bearer <token>` com um token JWT válido e não expirado
- **THEN** o sistema DEVE permitir a execução do handler da rota, com os dados do usuário autenticado disponíveis na requisição

#### Scenario: Acesso a rota protegida sem token
- **WHEN** uma requisição é enviada a uma rota decorada com `@UseGuards(JwtAuthGuard)` sem o header `Authorization`
- **THEN** o sistema DEVE retornar HTTP 401 sem executar o handler da rota

#### Scenario: Acesso a rota protegida com token inválido ou expirado
- **WHEN** uma requisição é enviada a uma rota decorada com `@UseGuards(JwtAuthGuard)` com um header `Authorization: Bearer <token>` cujo token é malformado, tem assinatura inválida ou está expirado
- **THEN** o sistema DEVE retornar HTTP 401 sem executar o handler da rota

#### Scenario: Acesso a rota sem o guard aplicado
- **WHEN** uma requisição é enviada a uma rota que não possui `@UseGuards(JwtAuthGuard)`, sem qualquer header `Authorization`
- **THEN** o sistema DEVE permitir a execução do handler normalmente, sem exigir autenticação
