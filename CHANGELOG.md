### band-tools

### Controle de versionamento e atualizações da api:

### [Version - 0.3.0] - 2026-07-02

#### Feat

- Cadastro de usuário (`POST /users`): criação de `UserEntity`, `CreateUserDto`, `CreateUserUseCase`, `UserTypeormEntity`, `UserRepository` e migration da tabela `users`
- Campos obrigatórios: `first_name`/`last_name` (2 a 100 caracteres), `email` (único, formato válido, até 254 caracteres), `phone` (8 a 11 caracteres, DDD + número local, sem prefixo de país), `password` (8 a 72 caracteres, com ao menos uma letra e um número); campo `avatar` reservado (`text`, nullable) para uma futura implementação de upload
- Senha protegida por hash `bcrypt` (nunca retornada em nenhuma resposta da API); custo do hash configurável via a nova variável de ambiente `BCRYPT_SALT_ROUNDS`
- Rejeição de e-mail duplicado com HTTP 409 (`IUserRepository.findBy`)
- Validações via `class-validator` e documentação Swagger para o endpoint
- Testes unitários com 100% de cobertura e testes e2e para o cadastro de usuário

#### Fix

- Scripts `migration:*` do `package.json` apontavam para um caminho inexistente (`src/infrastructure/database/`); corrigidos para `src/infrastructure/typeorm/`
- `DB_SYNCHRONIZE`/`DB_AUTO_LOAD_ENTITIES` eram sempre interpretados como `true` por um bug de conversão booleana no `class-transformer`; corrigido com `@Transform` explícito lendo o valor bruto da variável de ambiente
- Validação numérica de `PORT`/`DB_PORT`/`BCRYPT_SALT_ROUNDS` corrigida com `@Type(() => Number)` explícito, evitando depender de metadata refletida (desligada de propósito nos testes)

### [Version - 0.2.0] - 2026-07-01

#### Feat

- Cadastro de banda (`POST /bands`): criação de `BandEntity`, `CreateBandDto`, `CreateBandUseCase`, `BandTypeormEntity`, `BandRepository` e migration da tabela `bands`
- Campos obrigatórios: `name`, `genre` (string livre), `state`, `city`, `neighborhood`, `address`, `started_at`; campos opcionais: `description`, `image`
- Validações via `class-validator` e documentação Swagger para o endpoint
- Testes unitários com 100% de cobertura e testes e2e para o cadastro de banda

### [Version - 0.1.0] - 2026-05-31

#### Chore

- Estrutura e configuração inicial do projeto
- Criação do endpoint /health
- Testes unitários com 100% de cobertura
