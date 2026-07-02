## 1. Dependências

- [x] 1.1 Adicionar `bcrypt` e `@types/bcrypt` (dev) ao `package.json` e instalar

## 2. Domínio

- [x] 2.1 Criar `UserEntity` em `src/domain/entities/user/user.entity.ts` estendendo `BaseEntity`; construtor recebe um objeto de props tipado com os campos obrigatórios (`first_name`, `last_name`, `email`, `phone`, `password`) e opcional (`avatar`, reservado — não preenchido nesta mudança), atribuindo cada um à sua propriedade; `id`, `created_at` e `updated_at` são definidos via `super()`
- [x] 2.2 Criar `IUserRepository` em `src/domain/repositories/user/user.repository.interface.ts` com as assinaturas `save(user: UserEntity): Promise<void>` e `findBy(filter: UserFilter): Promise<UserEntity | null>`, onde `UserFilter` é um tipo com campos opcionais (ex.: `{ email?: string }`) usado para buscar um usuário por qualquer combinação de campos
- [x] 2.3 Criar `IPasswordHasher` em `src/domain/services/password-hasher.interface.ts` com a assinatura `hash(plainPassword: string): Promise<string>`

## 3. DTOs

- [x] 3.1 Criar `CreateUserDto` em `src/shared/communication/dtos/user/create-user.dto.ts` com os seguintes campos e decorators:
  - `first_name`: `@IsString() @MinLength(2) @MaxLength(100)` — obrigatório
  - `last_name`: `@IsString() @MinLength(2) @MaxLength(100)` — obrigatório
  - `email`: `@IsEmail() @MaxLength(254)` — obrigatório
  - `phone`: `@IsString() @MinLength(8) @MaxLength(11)` — obrigatório, DDD + número local, sem prefixo de país
  - `password`: `@IsString() @MinLength(8) @MaxLength(72) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)` — obrigatório; `@MaxLength(72)` reflete o limite real de bytes processados pelo `bcrypt`
  - `avatar` **não faz parte deste DTO** — reservado para uma mudança futura de upload/atualização de avatar
  - Todos os campos documentados com `@ApiProperty` / `@ApiPropertyOptional`

## 4. Use Case

- [x] 4.1 Criar `CreateUserUseCaseInterface` em `src/application/usecase/user/interfaces/create-user.usecase.interface.ts` com a assinatura `execute(dto: CreateUserDto): Promise<void>`
- [x] 4.2 Criar `CreateUserUseCase` em `src/application/usecase/user/create-user.usecase.ts` implementando `CreateUserUseCaseInterface`; construtor recebe `IUserRepository` e `IPasswordHasher` por injeção de dependência; `execute` chama `findBy({ email: dto.email })`, lança `ApplicationConflictException` se retornar um usuário existente, gera o hash da senha via `IPasswordHasher.hash`, instancia `UserEntity` com a senha já hasheada e chama `save`

## 5. Infraestrutura

- [x] 5.1 Criar `UserTypeormEntity` em `src/infrastructure/entities/user/user-typeorm.entity.ts` mapeando todos os campos para o banco (nomeada `UserTypeormEntity` para evitar conflito com a entidade de domínio `UserEntity`); `first_name`/`last_name` `varchar(100)`, `email` `varchar(254)` com `unique: true`, `phone` `varchar(11)`, `password` `varchar(60)`, `avatar` `text` nullable — reservado, não recebe valor no fluxo de criação
- [x] 5.2 Criar `BcryptPasswordHasher` em `src/infrastructure/services/bcrypt-password-hasher.ts` implementando `IPasswordHasher` usando `bcrypt.hash`; custo do hash lido de `EnvConfigService.bcryptSaltRounds` (injetado via construtor), não uma constante fixa
- [x] 5.3 Criar `UserRepository` em `src/infrastructure/repository/user/user.repository.ts` implementando `IUserRepository`
- [x] 5.4 Gerar migration com `npm run migration:generate -- --name=create-users-table`; garantir constraint `UNIQUE` na coluna `email`; tamanhos de coluna alinhados aos limites técnicos conhecidos (ver 5.1); `avatar` e `deleted_at` nullable
- [x] 5.5 Rodar a migration com `npm run migration:run` e validar a tabela no banco

## 6. Camada HTTP

- [x] 6.1 Criar `UserController` em `src/http/user/user.controller.ts` com o endpoint `POST /users` decorado com `@HttpCode(HttpStatus.CREATED)`; injetar o use case via `@Inject(UserFactoryModule.CREATE_USER_USE_CASE)` tipado como `CreateUserUseCaseInterface`
- [x] 6.2 Criar `UserFactoryModule` em `src/http/user/user-factory.module.ts` seguindo o padrão do `BandFactoryModule`; `useFactory` recebe `UserRepository` e `BcryptPasswordHasher` via `inject` e os passa como argumentos do construtor de `new CreateUserUseCase(userRepository, passwordHasher)`
- [x] 6.3 Importar `UserFactoryModule.forRoot()` e `UserController` no `HttpModule` (`src/http/http.module.ts`), seguindo o mesmo padrão de `BandFactoryModule`/`BandController`
- [x] 6.4 Adicionar decorators de Swagger ao controller:
  - `@ApiTags('users')`
  - `@ApiOperation({ summary: 'Register a new user' })`
  - `@ApiResponse({ status: 201, description: 'User created successfully' })`
  - `@ApiResponse({ status: 409, description: 'Conflict — email already registered' })`
  - `@ApiResponse({ status: 422, description: 'Unprocessable Entity — validation failed' })`
  - `@ApiResponse({ status: 500, description: 'Internal Server Error' })`

## 7. Testes Unitários

- [x] 7.1 Escrever testes unitários para `UserEntity` — validar atribuição correta de todos os campos via construtor, `id` gerado como UUIDv7, `created_at`/`updated_at` herdados de `BaseEntity`
- [x] 7.2 Escrever testes unitários para `CreateUserUseCase` — mockar `IUserRepository` e `IPasswordHasher`, validar que `findBy` é chamado com `{ email: dto.email }`, que `ApplicationConflictException` é lançada quando `findBy` retorna um usuário existente, que `hash` é chamado com a senha em texto puro, e que `save` é chamado com uma `UserEntity` contendo a senha já hasheada
- [x] 7.3 Escrever testes unitários para `BcryptPasswordHasher` — validar que `hash` retorna um valor diferente da senha original
- [x] 7.4 Escrever testes unitários para `UserRepository` — mockar `Repository`/`DataSource` do TypeORM, validar que `save` persiste a entidade e mapeia corretamente para o domínio, e que `findBy` monta a cláusula `where` a partir do filtro informado e retorna a entidade mapeada ou `null` quando não encontrado
- [x] 7.5 Escrever testes unitários para `UserController` — mockar `CreateUserUseCaseInterface`, validar que `POST /users` chama `execute` e retorna HTTP 201 sem corpo
- [x] 7.6 Escrever testes unitários para `CreateUserDto` — usar `validate()` do `class-validator` para validar que cada campo obrigatório falha quando ausente e que cada regra de validação é aplicada (tamanho mínimo, formato de e-mail, força da senha)
- [x] 7.7 Verificar 100% de cobertura para todos os arquivos acima com `npm run test:cov`

## 8. Testes E2E

- [x] 8.1 Escrever testes e2e para `POST /users` (cenários: sucesso, campo obrigatório ausente, e-mail em formato inválido, e-mail duplicado retornando 409, senha fraca, corpo malformado retornando 400)

## 9. Ajustes pós-implementação

- [x] 9.1 Reduzir `phone` para `varchar(11)`/`@MaxLength(11)` (sem prefixo de país) e editar a migration já gerada para refletir o novo tamanho
- [x] 9.2 Dimensionar colunas de string por limites técnicos conhecidos: `first_name`/`last_name` `varchar(100)`, `email` `varchar(254)` (RFC 5321), `password` `varchar(60)` (tamanho fixo de um hash `bcrypt`); espelhar os mesmos limites como `@MaxLength` no `CreateUserDto`
- [x] 9.3 Promover `avatar` de `varchar(500)` para `text` (sem limite), por conta do tamanho de URLs assinadas de bucket em nuvem
- [x] 9.4 Adicionar `@MaxLength(72)` à senha em texto puro no `CreateUserDto`, refletindo o limite de bytes processados pelo `bcrypt`
- [x] 9.5 Tornar o custo do hash (`salt rounds`) configurável via nova variável de ambiente `BCRYPT_SALT_ROUNDS` (`.env`, `.env.example`, `test/setEnvVars.js`, `env-config.validation.ts`, `EnvConfigService.bcryptSaltRounds`); `BcryptPasswordHasher` passa a receber `EnvConfigService` por injeção de dependência; `UserFactoryModule` passa a importar `EnvConfigModule`
- [x] 9.6 Corrigir bugs pré-existentes descobertos durante a implementação (ver `design.md` § Bugs pré-existentes): caminho errado nos scripts `migration:*` do `package.json`; `DB_SYNCHRONIZE`/`DB_AUTO_LOAD_ENTITIES` sempre `true` por conversão booleana incorreta; validação numérica de `PORT`/`DB_PORT`/`BCRYPT_SALT_ROUNDS` nunca exercitada de verdade sob Jest; poluição de `process.env` entre arquivos de teste em `main.spec.ts`
- [x] 9.7 Atualizar testes unitários e e2e afetados pelos ajustes acima; manter 100% de cobertura (`npm run test:cov`) e e2e verde (`npm run test:e2e`)
