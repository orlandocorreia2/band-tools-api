# Tasks

## 1. Preparação

- [x] 1.1 Confirmar que `DB_PASSWORD` e `JWT_SECRET` de `test/setEnvVars.js` não coincidem com nenhuma credencial real (dev compartilhado, homologação, produção). Se coincidirem, rotacionar a credencial real antes de seguir.
  > `DB_PASSWORD` coincidia com o `.env` local e o `.env.example` (senha padrão do Postgres de dev, já pública no `.env.example`). `JWT_SECRET` é diferente. Homologação e produção não puderam ser verificadas daqui; o dono do ambiente precisa confirmar. Na 2.3 o valor virou placeholder (`unit-test-placeholder`).
- [x] 1.2 Instalar `@testcontainers/postgresql` como devDependency (`npm i -D @testcontainers/postgresql`), rodar `npm audit` e registrar o resultado. Confirmar que `docker info` responde de dentro do WSL.
  > `npm audit`: 16 vulnerabilidades, todas **anteriores** a esta change (nenhuma vem de `@testcontainers/postgresql`). Testcontainers 12 exige Node `>= 22.22`, então `.nvmrc` subiu de `v22.14.0` para `v22.23.3` (linha 22, a mesma do `Dockerfile`).

## 2. Postgres efêmero para e2e (TDD)

- [x] 2.1 Red: criar `test/e2e/support/test-infrastructure.e2e-spec.ts` com cenários que verificam (a) `DB_NAME` igual a `band_tools_test_${JEST_WORKER_ID}`, (b) `DB_PORT` diferente de `5432` e (c) a tabela `migrations` com uma linha por arquivo em `src/infrastructure/typeorm/migrations/`. Rodar `npm run test:e2e -- test-infrastructure` e confirmar que falha.
- [x] 2.2 Green: criar `test/e2e/support/global-setup.ts`. Ele sobe `PostgreSqlContainer('postgres:16-alpine')` com mensagem de erro clara se o Docker não responder, exporta `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD` em `process.env`, roda as migrations no banco `band_tools_template` via `DataSource` dedicado (sem aliases e sem importar `data-source.ts`), cria `band_tools_test_<1..maxWorkers>` com `TEMPLATE` e guarda o container em `globalThis`. Criar também `test/e2e/support/global-teardown.ts`, que chama `stop()`.
  > Correção pós-implementação: com Node < 22.22 o Testcontainers quebra já no `import` (`webidl.util.markAsUncloneable is not a function`). O novo `test/e2e/support/assert-supported-node.ts` é importado antes dele e falha com uma mensagem clara (`nvm install && nvm use`). O `package.json` ganhou `"engines": { "node": ">=22.22.0" }`.
  > O Testcontainers usa por padrão usuário e senha `test`. A senha passa a ser gerada com `crypto.randomBytes(24)` a cada execução, para cumprir o requisito de credencial efêmera.
- [x] 2.3 Criar `test/e2e/support/select-worker-database.ts` (`DB_NAME` por `JEST_WORKER_ID`). Em `test/setEnvVars.js`, trocar `=` por `??=` nas cinco variáveis `DB_*`. Atualizar `test/jest-e2e.json` com `globalSetup`, `globalTeardown`, os dois `setupFiles` e `testTimeout: 30000`.
  > Virou `.ts`, e não `.js`, para reaproveitar `test/e2e/support/test-database.constants.ts`.
- [x] 2.4 Rodar `npm run test:e2e -- test-infrastructure` e confirmar que passa. Depois rodar `npm run test` e confirmar que os unitários não foram afetados pelo `??=`.

## 3. Limpeza entre suites (TDD)

- [x] 3.1 Red: em `test/e2e/support/test-infrastructure.e2e-spec.ts`, adicionar cenários para `truncateAllTables`. O helper deve (a) esvaziar todas as tabelas de `entityMetadatas` e manter `migrations` intacta, e (b) lançar erro quando `dataSource.options.database` não começar com `band_tools_test_`. Confirmar que falha.
- [x] 3.2 Green: implementar `test/e2e/support/database-cleaner.ts` (um único `TRUNCATE ... RESTART IDENTITY CASCADE`, com guarda de nome do banco) e confirmar que os cenários passam.
- [x] 3.3 Adicionar `await truncateAllTables(app.get(getDataSourceToken()))` no `afterAll`, antes de `app.close()`, nas suites `auth/login`, `user/create`, `band/create` e `band/list`. Rodar essas suites.
- [x] 3.4 Repetir a task 3.3 para `band-song/*`, `band-setlist/*`, `band-setlist-song/*`, `band-booking/create` e `contact/*`.
- [x] 3.5 Rodar `npm run test:e2e` completo duas vezes seguidas. As duas devem passar, e ao final `docker ps -a` não deve listar containers do Testcontainers. Contar os registros de `users` no `band_tools_db` antes e depois e confirmar que o número não muda.
  > Duas execuções completas, 14 suites e 133 testes cada, sem containers residuais. Contagens do `band_tools_db` (`users`, `bands`, `band_members`, `user_contacts`) iguais antes e depois.

## 4. Complemento: `PersistenceModule` (refactor, com e2e como rede de segurança)

- [x] 4.1 Red: criar `test/unit/infrastructure/persistence/persistence.module.spec.ts`, verificando que o módulo exporta os 8 repositórios. Ajustar os specs dos factory modules (`test/unit/http/*/*-factory.module.spec.ts`) para esperar a importação de `PersistenceModule`. Confirmar que falham.
- [x] 4.2 Green: criar `src/infrastructure/persistence/persistence.module.ts` (`TypeOrmModule.forFeature` com todas as entities, declarando e exportando os 8 repositórios). Em `band`, `user`, `auth` e `contact`, trocar a declaração local de repositórios e o `forFeature` por `imports: [PersistenceModule]`. Revisar o `forFeature` de `src/http/http.module.ts` e removê-lo se ficar redundante.
  > O `HttpModule` também declarava `BandRepository`, `UserRepository` e `BandMemberRepository` para os guards. Eles saíram e o módulo passou a importar `PersistenceModule`. Os repositórios agora são singletons compartilhados; eles não guardam estado, então isso é seguro.
- [x] 4.3 Rodar `npm run test:cov` (100%) e `npm run test:e2e` completo e confirmar que nada mudou no comportamento.
  > `tsc --noEmit` tem 4 erros, os mesmos do `HEAD` (baseline comparado via worktree).

## 5. Complemento: camada de componente

- [x] 5.1 Criar `test/jest-component.json` e o script `test:component` no `package.json`. Criar `test/component/support/empty-infrastructure.module.ts` e `test/component/support/create-component-app.ts` (bootstrap com `overrideModule` de `InfrastructureModule` e `PersistenceModule`, `ValidationPipe` e `ExceptionFilterMiddleware` iguais aos do e2e).
- [x] 5.2 Implementar `InMemoryUserRepository` e `InMemoryBandRepository` em `test/component/support/repositories/`, com `implements IUserRepository`/`IBandRepository`, coleção encapsulada e `clear()`.
- [x] 5.3 Implementar `InMemoryBandMemberRepository`, `InMemoryBandSongRepository` e `InMemoryBandSetlistRepository`.
- [x] 5.4 Implementar `InMemoryBandSetlistSongRepository`, `InMemoryBandBookingRepository` e `InMemoryContactRepository`. Montar `InMemoryPersistenceModule` com os 8 providers (`{ provide: <Classe>, useClass: InMemory<Classe> }`) e um `InMemoryStore` com `clearAll()`.
  > Os providers usam `useFactory` com `inject: [InMemoryStore]` em vez de `useClass`, porque todos os repositórios compartilham o mesmo store (ex.: `saveWithOwner` grava em `bandMembers`).
- [x] 5.5 Red → Green: criar `test/component/band/create.component-spec.ts` cobrindo 201 com owner registrado no `InMemoryBandMemberRepository`, 401 sem token e 400 sem `name`, com `clearAll()` no `beforeEach`. Criar também `test/component/support/no-database-connection.component-spec.ts`, que confirma que nenhum `DataSource` foi registrado no container Nest.
  > O suporte (5.1 a 5.4) foi escrito antes dos specs, então não houve Red puro. Um teste de mutação (`is_owner: true` → `false` no `InMemoryBandRepository`) confirmou que o spec falha quando o comportamento quebra.
- [x] 5.6 Rodar `npm run test:component` com o Docker parado e confirmar que passa.
  > Para não derrubar os containers de dev em execução, o Docker parado foi simulado com `DB_HOST=203.0.113.1 DB_PORT=1 DOCKER_HOST=unix:///nonexistent.sock`. Passou em cerca de 1,7s, sem nenhuma tentativa de conexão.

## 6. Documentação e verificação final

- [x] 6.1 Atualizar `CLAUDE.md` (seções Testing e Useful Commands): Docker como pré-requisito do e2e, `npm run test:component`, o papel de cada camada e o aviso de que o e2e nunca usa o banco de dev.
- [x] 6.2 Rodar `npm run test:cov` (100%), `npm run test:e2e`, `npm run test:component` e `npm run lint` nos arquivos alterados. Confirmar que tudo passa.
  > 590 unitários (100%), 133 e2e e 5 de componente passando. ESLint: 0 erros nos arquivos novos e de `src/`, e 0 erros nas linhas adicionadas às suites e specs legados. Os erros `no-unsafe-*` e `no-unused-vars` que já existiam nesses arquivos ficaram fora do escopo.
