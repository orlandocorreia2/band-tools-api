## Context

Estado atual da infraestrutura de testes:

- `test/jest-e2e.json` define apenas `setupFiles: ["<rootDir>/setEnvVars.js"]`, sem `globalSetup`/`globalTeardown`.
- `test/setEnvVars.js` é compartilhado entre unitários (`jest.config.ts`) e e2e e **atribui** valores fixos a `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` (`band_tools_db`). Com isso, os e2e escrevem no banco do `docker-compose.dev.yml`.
- `TypeormModule` (`src/infrastructure/typeorm/typeorm.module.ts`) lê `DB_*` via `EnvConfigService`. `src/infrastructure/typeorm/data-source.ts` lê `process.env` diretamente e aponta para `migrations/**/*{.ts,.js}`.
- As 13 suites e2e sobem o `AppModule` inteiro, criam dados via HTTP e, em alguns casos, manipulam o banco direto via `DataSource`. Não há nenhuma limpeza.
- Os repositórios são registrados como **classe concreta** em cada `*FactoryModule` (ex.: `BandFactoryModule.forRoot()` declara `BandRepository`, `UserRepository` etc. e injeta com `inject: [BandRepository, ...]`). Guards como `AuthUserIsMemberBandGuard` também injetam as classes concretas. Não existe token por interface de repositório.
- Há 9 migrations criando 8 tabelas: `users`, `bands`, `band_members`, `band_songs`, `band_setlists`, `band_setlist_songs`, `band_bookings` e `user_contacts`.
- O repositório não tem pipeline de CI. A imagem de banco de dev é `postgres:16-alpine`.

Motivação: ver `proposal.md`. Requisitos: ver `specs/test-infrastructure/spec.md`.

## Goals / Non-Goals

**Goals:**
- e2e contra PostgreSQL real, efêmero, criado pelas migrations versionadas, sem nunca tocar o banco de dev.
- Manter a execução paralela do Jest sem que as suites interfiram entre si.
- Mudança mínima nas 13 suites existentes (idealmente uma linha no `afterAll`).
- Camada de componente rápida, sem Docker, reaproveitando o `AppModule` real e trocando só a persistência.
- Não alterar comportamento de runtime da aplicação.

**Non-Goals:**
- Criar pipeline de CI (fica registrado como pré-requisito: runner com Docker).
- Migrar testes e2e existentes para a camada de componente. Novas features decidem caso a caso.
- Usar banco em memória (SQLite/`pg-mem`) em qualquer camada.
- Introduzir tokens de interface para repositórios em toda a aplicação. O refactor de persistência se limita ao necessário para trocar implementações em teste.
- Cobertura de 100% para a camada de componente (a regra de 100% continua valendo só para `test/unit/`).

## Decisions

### D1. Testcontainers (`@testcontainers/postgresql`) no `globalSetup` do Jest e2e
`test/e2e/support/global-setup.ts` sobe `new PostgreSqlContainer('postgres:16-alpine')`, exporta as credenciais para `process.env` e guarda a instância em `globalThis` para o `globalTeardown` (`test/e2e/support/global-teardown.ts`), que chama `container.stop()`. O reaper Ryuk do Testcontainers remove o container mesmo se o processo do Jest for morto. Os workers do Jest são criados depois do `globalSetup` e herdam o `process.env`.
**Alternativas consideradas:**
- *Serviço `postgres-test` no `docker-compose`*: exige subir/derrubar manualmente, usa porta fixa (conflito com o dev) e credenciais fixas versionadas.
- *SQLite/`pg-mem`*: rejeitado na proposta (`timestamptz`, uuid, enums, compatibilidade com TypeORM 1.x).

### D2. Migrations reais no banco template, um banco por worker via `CREATE DATABASE ... TEMPLATE`
No `globalSetup`:
1. Um `DataSource` dedicado (sem aliases `@...`, pois `moduleNameMapper` não é aplicado a `globalSetup`) conecta no banco `band_tools_template`, roda `runMigrations()` e fecha a conexão.
2. Para `i` de `1` até `globalConfig.maxWorkers`, executa `CREATE DATABASE band_tools_test_<i> TEMPLATE band_tools_template`. A cópia é física e leva milissegundos, em vez de rodar as migrations N vezes.

Um novo `setupFiles` só do e2e (`test/e2e/support/select-worker-database.ts`) define `process.env.DB_NAME = \`band_tools_test_${process.env.JEST_WORKER_ID}\``. Com `--runInBand`, `JEST_WORKER_ID` é `1`.
**Por quê:** as suites já rodam em paralelo por padrão. Sem banco por worker, o `TRUNCATE` de uma suite apagaria dados de outra em execução.
**Alternativa considerada:** forçar `--runInBand` e usar banco único. É mais simples, mas deixa a suíte mais lenta à medida que cresce e esconde dependências de ordem. Continua disponível como fallback (`npm run test:e2e -- --runInBand`).

O `DataSource` de migrations reaproveita o glob de `data-source.ts` (`src/infrastructure/typeorm/migrations/**/*{.ts,.js}`), resolvido com `path.join` a partir de `test/e2e/support/`. O `data-source.ts` não é importado porque executa `dotenv/config` e poderia carregar um `.env` local com credenciais de dev.

### D3. `setEnvVars.js` com `??=` nas variáveis de banco
As cinco variáveis `DB_*` passam de `=` para `??=`, e as demais continuam como estão. Os unitários continuam com os mesmos valores (não abrem conexão) e os e2e recebem os valores do container. `DB_NAME` é sobrescrito depois pelo `select-worker-database.ts`, que vem após `setEnvVars.js` na lista de `setupFiles`.
**Segurança:** a senha passa a ser gerada pelo container por execução. O valor fixo em `setEnvVars.js` fica só como placeholder para os unitários e não deve coincidir com nenhuma credencial real (verificar na task 1.1).

### D4. Limpeza com `truncateAllTables(dataSource)` no `afterAll`
Helper em `test/e2e/support/database-cleaner.ts`. Ele lê as tabelas de `dataSource.entityMetadatas` (em vez de uma lista fixa, para não esquecer tabelas novas), monta um único `TRUNCATE TABLE "a", "b", ... RESTART IDENTITY CASCADE` e nunca inclui `migrations`. Cada suite chama `await truncateAllTables(app.get(getDataSourceToken()))` antes de `app.close()`.
**Por quê `afterAll` e não `beforeEach`:** as suites atuais criam usuário e token no `beforeAll` e compartilham esse estado entre os `it`. Truncar por teste quebraria esse padrão. O isolamento entre suites basta, já que o banco inteiro é descartado no fim.
**Guarda de segurança (fail secure):** o helper recusa executar (lança erro) se `dataSource.options.database` não começar com `band_tools_test_`. Isso impede um `TRUNCATE` no banco de dev caso alguém rode a suíte com variáveis erradas.

### D5. Complemento: `PersistenceModule` com tokens de classe e `InMemoryPersistenceModule`
Novo `src/infrastructure/persistence/persistence.module.ts`, que:
- importa `TypeOrmModule.forFeature([...todas as TypeORM entities])`;
- declara e **exporta** os 8 repositórios concretos (`BandRepository`, `BandMemberRepository`, `UserRepository`, `BandSetlistRepository`, `BandSetlistSongRepository`, `BandSongRepository`, `BandBookingRepository`, `ContactRepository`).

Os `*FactoryModule` (`band`, `user`, `auth`, `contact`) passam a importar `PersistenceModule` e removem suas listas locais de repositórios e o `forFeature`. Os `inject: [BandRepository, ...]` e os guards continuam iguais, porque o token é a própria classe.

Em teste, `test/component/support/in-memory-persistence.module.ts` fornece as mesmas classes como token, com implementação em memória:
```ts
{ provide: BandRepository, useClass: InMemoryBandRepository }
```
E o bootstrap da camada de componente faz:
```ts
Test.createTestingModule({ imports: [AppModule] })
  .overrideModule(InfrastructureModule).useModule(EmptyInfrastructureModule)
  .overrideModule(PersistenceModule).useModule(InMemoryPersistenceModule)
```
`overrideModule` existe desde NestJS 10, e o projeto usa `@nestjs/testing` 11. Trocar o `InfrastructureModule` remove o `TypeOrmModule.forRootAsync`, então nenhuma conexão é aberta.
**Por quê tokens de classe e não tokens de interface:** mantém o refactor mínimo e sem mudança nos consumidores. A implementação em memória declara `implements IBandRepository`, e o TypeScript garante a compatibilidade do contrato.
**Alternativa considerada:** `overrideProvider` repositório por repositório em cada factory. Rejeitada porque o `TypeOrmModule.forFeature` continuaria exigindo um `DataSource`, e cada nova suite teria que repetir 8 overrides.

### D6. Implementações em memória
Ficam em `test/component/support/repositories/` (código de teste, fora de `src/` e da cobertura de produção). Cada uma guarda uma coleção interna (ex.: `Map<string, BandEntity>`, seguindo o Object Calisthenics de coleção encapsulada) e expõe `clear()`. Um `InMemoryStore` agrega todas elas e é limpo em `beforeEach`. Regras que no banco são constraints (e-mail único em `users`, FKs) só são replicadas quando um teste de componente depende delas. Por isso a camada e2e continua sendo a fonte de verdade para constraints.

### D7. Configuração e scripts
- `test/jest-e2e.json`: `globalSetup`, `globalTeardown`, `setupFiles: [setEnvVars.js, e2e/support/select-worker-database.ts]` e `testTimeout: 30000`, porque o primeiro pull da imagem pode demorar.
- `test/jest-component.json`: `testRegex: ".component-spec.ts$"`, mesmo `moduleNameMapper` e `setupFiles: [setEnvVars.js]`.
- `package.json`: `"test:component": "jest --config ./test/jest-component.json"`.

## Risks / Trade-offs

- **[Docker obrigatório para e2e]** → Mensagem explícita no `globalSetup` quando o Docker não responde (try/catch no `start()` com erro orientando a iniciar Docker Desktop/WSL integration), documentação no `CLAUDE.md` e a camada de componente como alternativa sem Docker para feedback rápido.
- **[Docker em WSL/Windows]** → O Testcontainers usa o socket do Docker do ambiente onde o Jest roda. Rodar `npm run test:e2e` de dentro do WSL, com Docker Desktop e WSL integration ativos ou com Docker Engine no WSL.
- **[Tempo extra de ~3 a 5s por execução, mais o pull inicial da imagem]** → Aceito. A imagem já costuma estar em cache por causa do `docker-compose.dev.yml`.
- **[Env de `globalSetup` não chegar aos workers]** → Coberto pelo teste da task 2.4 (`DB_NAME` e porta do container verificados dentro de uma suite). Fallback: gravar as credenciais em um arquivo temporário em `os.tmpdir()` lido pelo `select-worker-database.ts` e apagado no teardown.
- **[Divergência entre repositório em memória e TypeORM]** → A camada de componente valida o contrato HTTP, não a persistência. Qualquer comportamento de query ou constraint precisa de cenário e2e. As implementações em memória ficam deliberadamente simples.
- **[Refactor do `PersistenceModule` quebrar o wiring]** → A suíte e2e (já no container) é executada antes e depois do refactor como rede de segurança. Os specs unitários dos factory modules, se existirem, são ajustados.
- **[Supply chain da nova dependência]** → `@testcontainers/postgresql` é mantido pela organização Testcontainers. Fixar a versão no `package-lock.json` e rodar `npm audit` após instalar.
- **[Vazamento de dados via logs de teste]** → Os dados de teste continuam fictícios (`@example.com`). Nenhuma credencial do container é logada, e o `globalSetup` não imprime a connection URI.

## Migration Plan

Nenhuma migration de banco. A mudança é só em infraestrutura de testes e wiring de módulos.

Ordem de rollout:
1. Container + `setEnvVars.js` + limpeza (e2e passa a ser isolado). A mudança é entregue e commitada de forma independente.
2. Complemento: `PersistenceModule`, depois `InMemoryPersistenceModule` e as primeiras suites de componente.

Rollback: reverter os commits. O `docker-compose.dev.yml` continua intacto, então voltar ao modo antigo não exige nada além disso.

## Open Questions

- A versão do PostgreSQL em produção é mesmo a 16? Se não for, a imagem do container deve seguir a de produção, e não a do `docker-compose.dev.yml`.
- Quando o CI for criado, qual será o provedor (GitHub Actions, Azure DevOps)? Isso define se o runner já tem Docker ou se é preciso Docker-in-Docker.
