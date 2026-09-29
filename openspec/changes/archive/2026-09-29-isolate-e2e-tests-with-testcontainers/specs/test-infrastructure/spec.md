## ADDED Requirements

### Requirement: Banco de dados efêmero para testes e2e
A suíte e2e (`npm run test:e2e`) DEVE (SHALL) executar contra uma instância PostgreSQL criada exclusivamente para aquela execução e destruída ao final dela.

A instância DEVE usar a mesma imagem PostgreSQL declarada em `docker-compose.dev.yml` (`postgres:16-alpine`).

A suíte e2e NÃO DEVE se conectar ao banco de desenvolvimento (`band_tools_db` do `docker-compose.dev.yml`) nem a qualquer banco pré-existente.

#### Scenario: Execução da suíte e2e sobe e destrói o banco
- **WHEN** `npm run test:e2e` é executado com Docker disponível
- **THEN** um container PostgreSQL DEVE ser iniciado antes da primeira suite e removido após a última, sem deixar containers ou volumes residuais

#### Scenario: Banco de dev não é tocado
- **WHEN** `npm run test:e2e` termina
- **THEN** a quantidade de registros em todas as tabelas do banco `band_tools_db` DEVE ser a mesma de antes da execução

#### Scenario: Docker indisponível
- **WHEN** `npm run test:e2e` é executado sem Docker em execução
- **THEN** a execução DEVE falhar no `globalSetup` com mensagem indicando que o Docker é pré-requisito, sem tentar conectar em `localhost:5432`

### Requirement: Schema criado pelas migrations versionadas
O schema do banco e2e DEVE ser criado exclusivamente executando as migrations de `src/infrastructure/typeorm/migrations/` sobre um banco vazio. `synchronize` DEVE permanecer `false`.

#### Scenario: Migrations aplicadas do zero
- **WHEN** o `globalSetup` da suíte e2e termina
- **THEN** a tabela `migrations` do banco de teste DEVE conter uma linha para cada arquivo de migration versionado

#### Scenario: Migration quebrada interrompe a suíte
- **WHEN** alguma migration falha ao ser executada sobre o banco vazio
- **THEN** a suíte e2e DEVE falhar antes de executar qualquer teste, exibindo o erro da migration

### Requirement: Credenciais de banco efêmeras nos testes e2e
As variáveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` usadas pelos testes e2e DEVEM ser fornecidas pelo container efêmero da execução corrente. `test/setEnvVars.js` NÃO DEVE sobrescrever variáveis `DB_*` já definidas no ambiente.

#### Scenario: Variáveis do container prevalecem
- **WHEN** uma suite e2e inicializa o `AppModule`
- **THEN** a conexão TypeORM DEVE usar o host, a porta e as credenciais do container, e não os valores padrão de `test/setEnvVars.js`

### Requirement: Isolamento de dados entre workers e suites
Cada worker do Jest e2e DEVE usar um banco de dados próprio dentro do container, criado a partir de um banco template já migrado, para que suites em paralelo não compartilhem dados.

Ao final de cada suite e2e, todas as tabelas de domínio DEVEM ser truncadas (`TRUNCATE ... RESTART IDENTITY CASCADE`), preservando a tabela `migrations`.

#### Scenario: Suites em paralelo não interferem
- **WHEN** duas suites e2e rodam simultaneamente em workers diferentes
- **THEN** cada uma DEVE enxergar apenas os registros que ela mesma criou

#### Scenario: Suite seguinte começa com banco limpo
- **WHEN** uma suite e2e termina e o mesmo worker inicia outra suite
- **THEN** as tabelas `users`, `bands`, `band_members`, `band_songs`, `band_setlists`, `band_setlist_songs`, `band_bookings` e `user_contacts` DEVEM estar vazias no início da nova suite

### Requirement: Camada de testes de componente sem banco de dados
O projeto DEVE oferecer uma camada de testes de componente (`npm run test:component`, arquivos `test/component/**/*.component-spec.ts`) que sobe a aplicação NestJS com os controllers, guards, pipes e filtros reais, mas com todos os repositórios substituídos por implementações em memória.

Cada implementação em memória DEVE implementar a interface correspondente de `src/domain/repositories/` (`IBandRepository`, `IBandMemberRepository`, `IBandSongRepository`, `IBandSetlistRepository`, `IBandSetlistSongRepository`, `IBandBookingRepository`, `IUserRepository`, `IContactRepository`).

A camada de componente NÃO DEVE abrir conexão com banco de dados nem exigir Docker. Ela NÃO substitui a suíte e2e, que continua sendo a fonte de verdade para queries, constraints e migrations.

#### Scenario: Execução sem Docker e sem banco
- **WHEN** `npm run test:component` é executado em uma máquina sem Docker e sem PostgreSQL
- **THEN** todas as suites de componente DEVEM executar e nenhuma conexão TCP com a porta do PostgreSQL DEVE ser aberta

#### Scenario: Estado isolado por teste
- **WHEN** um teste de componente grava registros em um repositório em memória
- **THEN** o teste seguinte DEVE começar com os repositórios em memória vazios

#### Scenario: Contrato HTTP validado sem banco
- **WHEN** um teste de componente envia `POST /bands` com token válido e payload válido
- **THEN** a resposta DEVE ser HTTP 201 e a banda DEVE estar presente no `InMemoryBandRepository`, com o usuário autenticado como owner no `InMemoryBandMemberRepository`
