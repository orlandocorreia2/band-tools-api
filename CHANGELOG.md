### band-tools

### Controle de versionamento e atualizações da api:

### [Version - 0.7.0] - 2026-07-31

#### Feat

- Listagem das bandas do usuário autenticado (`GET /bands`), protegida por `JwtAuthGuard`: retorna, sem paginação, todas as bandas vinculadas ao usuário via `band_members` (dono ou membro comum, indistintamente)
- `IBandRepository` ganha `findAllByUserId(userId)`, implementado em `BandRepository` como join entre `bands` e `band_members` filtrado por `user_id` e ordenado por `created_at DESC`
- `ListBandsByUserUseCase`, o primeiro caso de uso de leitura do projeto
- `BandResponseDto` e `ListBandsResponseDto`, os primeiros response DTOs do projeto: a resposta segue o formato de envelope `{ "data": [...] }`, com o array de bandas na chave `data`
- Testes unitários com 100% de cobertura e testes e2e cobrindo bandas próprias e de participação, usuário sem nenhuma banda, requisição sem autenticação (401) e exclusão de bandas pertencentes apenas a outros usuários

### [Version - 0.6.0] - 2026-07-31

#### Feat

- Cadastro de música no repertório de uma banda (`POST /bands/:id/song`): campo `title` obrigatório e `tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes` opcionais, persistidos na nova tabela `band_songs`
- Migration `create-band-songs-table`: `band_id` como foreign key para `bands.id` (`ON DELETE CASCADE`) e índice dedicado em `band_id`
- `BandSongEntity`, `IBandSongRepository`, `BandSongTypeormEntity` e `BandSongRepository` na camada de domínio/infraestrutura
- `AuthUserIsMemberBandGuard`, aplicado em conjunto com `JwtAuthGuard`, responsável por validar nesta ordem: existência da banda (`IBandRepository.findById`, 404), existência do usuário autenticado (`IUserRepository.findBy`, 404) e vínculo de membership (`IBandMemberRepository.existsByBandAndUser`, 403), antes de liberar o cadastro
- `IBandRepository` ganha `findById(id)`; `IBandMemberRepository` ganha `existsByBandAndUser(bandId, userId)`
- Testes unitários com 100% de cobertura e testes e2e cobrindo cadastro com sucesso (somente obrigatório e completo), corpo malformado (400), campo obrigatório ausente/inválido (422), `id` de banda inválido (422), banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)

#### Refactor

- Decorators Swagger de `POST /bands` extraídos para `ApiCreateBand` (`src/http/band/decorators/`), seguindo o mesmo padrão adotado em `POST /bands/:id/song` (`ApiCreateBandSong`)

### [Version - 0.5.0] - 2026-07-21

#### Feat

- Vínculo automático de dono ao cadastrar uma banda (`POST /bands`): o usuário autenticado passa a ser registrado como dono (`is_owner = true`) em `band_members`, a nova tabela pivô do relacionamento N:N entre `users` e `bands`
- Migration `create-band-members-table`: chave primária composta (`band_id`, `user_id`), foreign keys para `bands.id`/`users.id` com `ON DELETE CASCADE` e índice dedicado em `user_id` para buscas por usuário
- `BandMemberEntity`, `IBandMemberRepository`, `BandMemberTypeormEntity` e `BandMemberRepository` na camada de domínio/infraestrutura
- `IBandRepository.saveWithOwner`: persiste a banda e o vínculo de dono em uma única transação (`DataSource.transaction()`), com rollback conjunto caso qualquer uma das duas gravações falhe
- `CreateBandUseCase` passa a validar se o usuário autenticado (`sub` do JWT) ainda existe em `users` antes de criar a banda, retornando HTTP 404 em vez de um erro de constraint do banco quando o registro do usuário foi excluído após a emissão do token
- `IUserRepository`/`UserFilter` ganham suporte a busca por `id`
- Testes unitários com 100% de cobertura e testes e2e cobrindo o vínculo automático de dono, o cascade de exclusão de `band_members` e o cenário de usuário excluído com token ainda válido

#### Refactor

- Removido o método `save` de `IBandRepository`/`BandRepository`, que ficou sem uso após `CreateBandUseCase` passar a depender exclusivamente de `saveWithOwner`; `BandRepository` não injeta mais `Repository<BandTypeormEntity>`, apenas `DataSource`

### [Version - 0.4.0] - 2026-07-21

#### Feat

- Autenticação de usuário (`POST /auth/login`): recebe `email` e `password`, localiza o usuário e compara a senha contra o hash `bcrypt` armazenado via `IPasswordHasher.compare`
- Emissão de JWT assinado (`accessToken`) em caso de sucesso, com payload `{ sub: user.id, email: user.email }`; expiração/segredo configuráveis via `JWT_SECRET`/`JWT_EXPIRES_IN`
- `JwtAuthGuard` (`CanActivate`) para proteger rotas individualmente via `@UseGuards(JwtAuthGuard)`, extraindo e validando o token do header `Authorization: Bearer <token>` e anexando `id`/`email` do usuário autenticado à requisição; rotas sem o guard permanecem públicas
- Guard aplicado em `POST /bands` como primeira rota protegida
- Validações via `class-validator` e documentação Swagger (`@ApiBearerAuth`) para o novo endpoint e para `POST /bands`
- Testes unitários com 100% de cobertura e testes e2e para login e para o acesso protegido a `POST /bands`

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
