## Context

A API ainda não possui uma entidade para representar as pessoas que operam o sistema. Este é o segundo módulo de domínio a ser construído (após `Band`) e reaproveita a `BaseEntity` já existente (`id` UUIDv7, `created_at`, `updated_at`) e o mesmo padrão de camadas (domínio → aplicação → infraestrutura → HTTP) usado no cadastro de bandas.

## Goals / Non-Goals

**Goals:**

- Criar a entidade `User` na camada de domínio com campos obrigatórios e opcionais bem definidos
- Garantir que a senha nunca seja persistida em texto puro
- Criar uma migration versionada para a tabela `users`
- Expor `POST /users` com validação, documentação Swagger e tratamento de erros
- Garantir 100% de cobertura de testes unitários para todos os arquivos gerados e cobertura e2e para o endpoint

**Non-Goals:**

- Autenticação (login, geração de token/sessão) — pertence a uma mudança separada
- Listagem ou consulta de usuários
- Atualização ou remoção de usuários
- Associação de usuário a uma banda (membro) — pertence a um módulo separado
- Upload ou preenchimento de `avatar` no cadastro — a coluna é criada, mas o preenchimento fica para uma mudança futura
- Verificação de e-mail (confirmação por link/código)

## Decisions

### 1. `id`, `created_at` e `updated_at` herdados de `BaseEntity`

**Decisão:** `UserEntity` estende a `BaseEntity` já existente, reaproveitando a geração de `id` em UUIDv7 e o preenchimento de `created_at`/`updated_at` no construtor. Nenhuma lógica de identidade é duplicada.
**Razão:** Mesma razão estabelecida na mudança `band-registration` — centraliza a responsabilidade de identidade/timestamps em um único lugar.

### 2. `email` como campo único e validado

**Decisão:** `email` é um campo obrigatório, validado como endereço de e-mail (`@IsEmail()`) e com constraint `UNIQUE` na tabela `users`. Antes de persistir, o `CreateUserUseCase` chama `IUserRepository.findBy({ email: dto.email })` e, se retornar um usuário existente, lança `ApplicationConflictException` (HTTP 409).
**Razão:** É o identificador natural para autenticação futura e para comunicação com o usuário (recuperação de senha, notificações). Validar o formato evita dados inconsistentes desde o cadastro. A verificação na camada de aplicação retorna um erro de negócio claro (409) em vez de deixar o cliente descobrir o conflito por um erro genérico de constraint do banco (500).
**Alternativa considerada:** Usar `phone` como identificador único — rejeitada porque números de telefone mudam com mais frequência e não são um padrão universal de login como e-mail. Confiar apenas na constraint `UNIQUE` do banco e mapear a violação no `ExceptionFilterMiddleware` — rejeitada por acoplar a regra de negócio a um detalhe de infraestrutura (código de erro do driver do Postgres).

### 3. `findBy(filter)` genérico em vez de `existsByEmail`

**Decisão:** `IUserRepository` expõe um método genérico `findBy(filter: UserFilter): Promise<UserEntity | null>`, onde `UserFilter` aceita qualquer combinação de campos (ex.: `{ email: 'foo@bar.com' }`), em vez de um método específico `existsByEmail(email: string): Promise<boolean>`.
**Razão:** Um método de busca genérico é reutilizável para qualquer campo de busca futuro (ex.: buscar por `phone`) sem precisar adicionar um novo método a cada nova necessidade de consulta, mantendo a interface do repositório enxuta. Retornar a entidade (e não um booleano) também permite que o use case reaproveite os dados do usuário encontrado, caso necessário.
**Alternativa considerada:** Método específico `existsByEmail` — rejeitado por acoplar a interface a um único campo de busca, exigindo um novo método para cada critério futuro.

### 4. `phone` sem constraint de unicidade

**Decisão:** `phone` é um campo obrigatório de contato, sem `UNIQUE` no banco.
**Razão:** Com `email` já cobrindo o papel de identificador único, exigir unicidade também em `phone` traria fricção desnecessária (ex.: familiares compartilhando o mesmo número) sem benefício real para o domínio.

### 4.1. `phone` limitado a 11 caracteres, sem prefixo de país

**Decisão:** `phone` aceita entre 8 e 11 caracteres (`@MinLength(8) @MaxLength(11)`), representando apenas DDD + número local (ex.: `11912345678`), sem `+55` ou qualquer outro prefixo de país. A coluna no banco é `varchar(11)`.
**Razão:** Consistente com a decisão nº 4 do design de `band-registration` (produto de escopo nacional, Brasil apenas) — o prefixo de país é redundante e apenas aumenta o tamanho armazenado sem necessidade nesta fase.
**Alternativa considerada:** Aceitar o número com `+55` e normalizar/remover o prefixo no backend antes de persistir — rejeitada por adicionar lógica de parsing/normalização sem benefício claro nesta fase; mais simples exigir o formato já normalizado na entrada.

### 5. Hash de senha via interface `IPasswordHasher` + `bcrypt`

**Decisão:** É criada uma interface `IPasswordHasher` na camada de domínio (`hash(plainPassword: string): Promise<string>`), implementada por `BcryptPasswordHasher` na infraestrutura usando a biblioteca `bcrypt`. O `CreateUserUseCase` recebe essa interface por injeção de dependência e a utiliza para gerar o hash antes de instanciar `UserEntity`.
**Razão:** Segue o mesmo princípio de inversão de dependência já aplicado em `IBandRepository` — o domínio e o use case não conhecem a biblioteca concreta de hashing, apenas o contrato. Isso facilita testes (mock da interface) e permite trocar o algoritmo de hash no futuro sem tocar no use case.
**Alternativa considerada:** Chamar `bcrypt` diretamente dentro do use case — rejeitada por acoplar a camada de aplicação a uma biblioteca específica, indo contra o padrão de inversão de dependência já adotado no projeto.

### 6. Senha nunca retorna na resposta

**Decisão:** Assim como no cadastro de banda, `execute()` do `CreateUserUseCase` retorna `Promise<void>` e o controller responde HTTP 201 sem corpo.
**Razão:** Evita qualquer risco de vazamento do hash da senha na resposta da API e mantém consistência com o padrão já usado em `POST /bands`.

### 7. `UserTypeormEntity` para evitar conflito de nome

**Decisão:** A entidade TypeORM é nomeada `UserTypeormEntity`, distinta da entidade de domínio `UserEntity`, seguindo o mesmo padrão de `BandTypeormEntity`.
**Razão:** Evita ambiguidade de import e mantém a convenção já estabelecida no projeto.

### 8. Nova dependência `bcrypt`

**Decisão:** Adicionar `bcrypt` (+ `@types/bcrypt` como dependência de desenvolvimento) ao `package.json`.
**Razão:** É a biblioteca padrão de mercado para hash de senha em Node.js, com suporte maduro e amplamente auditado.
**Alternativa considerada:** `argon2` — tecnicamente mais moderna, porém rejeitada nesta fase para manter a menor superfície de novas dependências nativas (bcrypt já é amplamente utilizado no ecossistema NestJS).

### 9. `avatar` como coluna reservada, não exposta no cadastro

**Decisão:** `avatar` é uma string opcional (nullable) na entidade e na tabela `users`, mas **não faz parte de `CreateUserDto`** — o cadastro de usuário sempre cria o registro com `avatar` nulo. O preenchimento (upload ou definição de URL) será implementado em uma mudança futura.
**Razão:** O cliente ainda não tem um fluxo de upload de imagem definido; expor o campo no cadastro sem essa lógica permitiria enviar URLs arbitrárias sem validação. Reservar a coluna evita uma migration adicional quando a funcionalidade for implementada.
**Alternativa considerada:** Aceitar `avatar` como string opcional em `CreateUserDto` já nesta mudança — rejeitada por adicionar um campo sem um fluxo de upload/validação correspondente, escopo definido apenas para uma mudança futura.

### 10. Soft delete com `deleted_at`

**Decisão:** Campo `deleted_at` (timestamp nulo) incluído no schema para suporte futuro a soft delete. Nenhuma operação de remoção é exposta nesta mudança.
**Razão:** Mesma razão da mudança `band-registration` — preserva histórico e evita perda acidental de dados.

### 11. Tamanhos de coluna dimensionados por limites técnicos conhecidos

**Decisão:** Os campos de string ganharam tamanhos máximos alinhados a limites reais, em vez de valores arbitrários (`varchar(255)` genérico):
- `first_name` / `last_name`: `varchar(100)`
- `email`: `varchar(254)` — limite real de um endereço de e-mail pela RFC 5321
- `phone`: `varchar(11)` — DDD + número local, sem prefixo de país (decisão 4.1)
- `password` (coluna, já com hash): `varchar(60)` — um hash `bcrypt` tem sempre exatamente 60 caracteres, independentemente do algoritmo de custo ou do tamanho da senha original
- `avatar`: `text` (sem limite) — ver decisão 12

**Razão:** No Postgres, `varchar(n)` não reserva espaço fixo (o custo de armazenamento é pelo conteúdo real, não pelo limite declarado), então não há motivo para deixar colunas sem limite algum quando o domínio já define um teto conhecido. Isso também evita que a coluna aceite silenciosamente dados muito maiores do que o esperado.
**Alternativa considerada:** Manter todos os campos como `varchar(255)` (valor arbitrário copiado de `band-registration`) — rejeitada por não refletir nenhum limite real do domínio de cada campo.

### 12. `avatar` como `text`, não `varchar(500)`

**Decisão:** A coluna `avatar` foi promovida de `varchar(500)` para `text` (sem limite).
**Razão:** O valor será uma URL de um bucket de armazenamento em nuvem (S3, GCS, Azure Blob). URLs assinadas/presigned carregam query strings de assinatura, credenciais e expiração que facilmente ultrapassam 500 caracteres (chegando a 1000+ com session tokens do STS da AWS), o que arriscaria truncamento silencioso ou erro de inserção. Como `text` não tem custo extra de armazenamento no Postgres frente a um `varchar(n)` generoso, não há trade-off em eliminar esse limite.
**Alternativa considerada:** `varchar(1024)` (cobrindo o limite máximo de uma key do S3) — rejeitada em favor de `text`, que elimina de vez qualquer risco de truncamento independentemente do provedor/formato de URL usado no futuro. Recomendação de design para quando o upload de avatar for implementado: preferir salvar apenas a key/path do objeto (não a URL assinada em si, que expira) e gerar a URL sob demanda na leitura.

### 13. `password` em texto puro limitado a 72 caracteres no DTO

**Decisão:** `CreateUserDto.password` ganhou `@MaxLength(72)`, além do `@MinLength(8)` já existente.
**Razão:** O `bcrypt` processa no máximo 72 bytes da senha em texto puro — qualquer byte além disso é silenciosamente ignorado no hash. Sem esse limite na validação, um usuário poderia definir uma senha maior acreditando que ela inteira é significativa, quando na prática apenas os 72 primeiros bytes são considerados na verificação.
**Alternativa considerada:** Não limitar e aceitar o comportamento de truncamento do `bcrypt` — rejeitada por ser uma pegadinha conhecida do algoritmo que pode confundir o usuário sobre a real força da própria senha.

### 14. `BCRYPT_SALT_ROUNDS` como variável de ambiente, não constante fixa

**Decisão:** O custo do hash (`salt rounds`) do `bcrypt` é lido de `EnvConfigService.bcryptSaltRounds` (variável de ambiente `BCRYPT_SALT_ROUNDS`, validada com `@Type(() => Number) @IsNumber() @Min(4) @Max(20)`), em vez de uma constante `SALT_ROUNDS = 10` fixa no código. `BcryptPasswordHasher` recebe `EnvConfigService` por injeção de dependência.
**Razão:** Permite ajustar o custo do hash por ambiente (ex.: valor menor em testes/CI para velocidade, maior em produção para segurança) sem alterar código ou gerar um novo deploy.
**Alternativa considerada:** Manter a constante fixa no código — rejeitada por exigir alteração de código e novo build para qualquer ajuste de custo do hash.

## Risks / Trade-offs

- **[Risco] Senha fraca aceita se a validação for muito permissiva** → Mitigação: exigir no mínimo 8 caracteres com pelo menos uma letra e um número via `@MinLength(8)` + `@Matches`.
- **[Trade-off] `deleted_at` presente mas não utilizado nesta mudança** → Mesma decisão já aceita no módulo de bandas; documentado como reservado para uso futuro.
- **[Risco] `bcrypt` é uma dependência nativa (bindings em C++)** → Pode exigir rebuild em ambientes com Node/OS diferentes. Mitigação: já é amplamente suportado no ecossistema NestJS/Docker; documentar no Dockerfile caso necessário.

## Bugs pré-existentes encontrados e corrigidos durante a implementação

Não faziam parte do escopo original desta mudança, mas bloqueavam ou comprometiam a implementação correta do cadastro de usuário, então foram corrigidos junto:

- **Scripts de migration com caminho errado**: `package.json` apontava `migration:generate|run|revert|create|show` para `src/infrastructure/database/...`, um diretório que não existe (o código real está em `src/infrastructure/typeorm/...`). Corrigido nos 5 scripts.
- **`DB_SYNCHRONIZE` sempre `true`**: a conversão implícita do `class-transformer` fazia `Boolean('false') === true`, então o `synchronize` do TypeORM ficava sempre ativo independentemente do valor em `.env` — violando a própria regra do projeto de nunca usar `synchronize: true`. Isso já havia criado a tabela `bands` sem nenhuma migration registrada. Corrigido com `@Transform` explícito lendo `obj[key]` (valor bruto, antes da conversão implícita) para `DB_SYNCHRONIZE` e `DB_AUTO_LOAD_ENTITIES`.
- **Validação numérica de env vars nunca testada de verdade**: `PORT`, `DB_PORT` (e o novo `BCRYPT_SALT_ROUNDS`) dependiam da metadata refletida do TypeScript para a conversão implícita de string → number, mas o `jest.config.ts` desliga `emitDecoratorMetadata` de propósito — então, sob Jest, essas validações sempre falhavam quando exercitadas sem mock (o que nunca acontecia antes, pois todo teste existente mockava `ConfigModule`/`EnvConfigModule`). Corrigido com `@Type(() => Number)` explícito nos três campos.
- **Poluição de `process.env` entre arquivos de teste**: `test/unit/main.spec.ts` fazia `delete process.env.PORT`/`NODE_ENV` num `afterEach` sem restaurar, afetando outros arquivos de teste no mesmo worker do Jest que dependessem desses valores. Corrigido para restaurar os valores originais.
