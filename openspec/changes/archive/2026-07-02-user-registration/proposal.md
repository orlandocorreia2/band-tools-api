## Why

A aplicação ainda não possui uma forma de cadastrar as pessoas que irão operá-la (administradores de banda, membros com acesso ao sistema, etc.). O cadastro de usuário é uma capacidade fundamental que precisa existir antes de autenticação, autorização ou associação de pessoas a bandas.

## What Changes

- Criação da entidade de domínio `UserEntity` estendendo a `BaseEntity` já existente (que fornece `id` em UUIDv7, `created_at` e `updated_at`), com os campos próprios: `first_name`, `last_name`, `email`, `phone`, `password`, `avatar` (opcional), `deleted_at`
- `avatar` armazena o caminho/URL da imagem do usuário como `text` (sem limite de tamanho, pensando em URLs assinadas de bucket em nuvem), mas **não é informado no cadastro**: a coluna é criada na tabela (nullable) apenas reservada para uma futura implementação de upload/atualização de avatar; `CreateUserDto` não expõe esse campo
- `email` é único, validado como um endereço de e-mail válido e limitado a 254 caracteres (limite real de um endereço de e-mail pela RFC 5321); o cadastro rejeita e-mails já existentes retornando HTTP 409
- `first_name` e `last_name` limitados a 100 caracteres
- `phone` é apenas um dado de contato (entre 8 e 11 caracteres, DDD + número local, sem prefixo de país), sem constraint de unicidade
- Senhas nunca são armazenadas em texto puro: criação da interface de domínio `IPasswordHasher`, implementada por `BcryptPasswordHasher` na camada de infraestrutura, usada pelo use case para gerar o hash da senha antes da persistência; a senha em texto puro é limitada a 72 caracteres no DTO (limite real de bytes processados pelo `bcrypt` — o excedente é ignorado silenciosamente pelo algoritmo) e a coluna `password` no banco é `varchar(60)` (tamanho fixo de um hash `bcrypt`)
- O custo do hash (`salt rounds` do `bcrypt`) é configurável via variável de ambiente `BCRYPT_SALT_ROUNDS`, em vez de uma constante fixa no código
- Criação da interface de repositório `IUserRepository` na camada de domínio, com método de busca genérico `findBy(filter)`
- Criação de `CreateUserUseCaseInterface` e `CreateUserUseCase` na camada de aplicação
- Implementação de `UserTypeormEntity` e `UserRepository` na camada de infraestrutura
- Criação da migration para a tabela `users`, com constraint `UNIQUE` no campo `email`
- Nova dependência: `bcrypt` (hash de senha)
- Exposição do endpoint REST:
  - `POST /users` — cadastrar um usuário

## Capabilities

### New Capabilities

- `user-management`: Cadastro de usuário — criação de um novo registro de usuário na tabela `users` com senha protegida por hash

### Modified Capabilities

## Impact

- Novos `UserFactoryModule` e `UserController` em `src/http/user/`
- Novos `UserTypeormEntity`, `UserRepository` e migration em `src/infrastructure/entities/user/`, `src/infrastructure/repository/user/`, `src/infrastructure/typeorm/migrations/`
- Novos `CreateUserUseCase` e `CreateUserUseCaseInterface` em `src/application/usecase/user/`
- Nova `UserEntity` em `src/domain/entities/user/`
- Nova `IUserRepository` em `src/domain/repositories/user/`
- Nova `IPasswordHasher` em `src/domain/services/` e `BcryptPasswordHasher` em `src/infrastructure/services/`
- Novo `CreateUserDto` em `src/shared/communication/dtos/user/`
- Nova dependência `bcrypt` (+ `@types/bcrypt`) no `package.json`
- Nova variável de ambiente `BCRYPT_SALT_ROUNDS` (`.env`, `.env.example`, `EnvConfigService`, `env-config.validation.ts`)
- API documentada via Swagger
- **Correções incidentais** encontradas e corrigidas durante a implementação (fora do escopo original, mas necessárias para o funcionamento correto do cadastro de usuário):
  - Scripts `migration:*` do `package.json` apontavam para um caminho inexistente (`src/infrastructure/database/`) — corrigidos para `src/infrastructure/typeorm/`
  - `DB_SYNCHRONIZE`/`DB_AUTO_LOAD_ENTITIES` eram sempre interpretados como `true` por um bug de conversão booleana no `class-transformer` (`Boolean('false') === true`) — corrigido com `@Transform` explícito lendo o valor bruto
  - Validações `@IsNumber()` de `PORT`, `DB_PORT` e `BCRYPT_SALT_ROUNDS` dependiam de metadata refletida que o Jest desliga propositalmente (`emitDecoratorMetadata: false`) — corrigido com `@Type(() => Number)` explícito
  - `test/unit/main.spec.ts` apagava `process.env.PORT`/`NODE_ENV` sem restaurar, poluindo o estado global entre arquivos de teste no mesmo worker do Jest — corrigido para restaurar os valores originais
