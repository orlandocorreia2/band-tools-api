## Why

Os testes e2e (`test/e2e/**/*.e2e-spec.ts`) rodam hoje contra o mesmo banco do ambiente de desenvolvimento: `test/setEnvVars.js` fixa `DB_HOST=localhost`, `DB_PORT=5432` e `DB_NAME=band_tools_db`, que é o banco criado pelo `docker-compose.dev.yml`. Isso traz três problemas:

- **Poluição do banco de dev**: cada execução cria usuários, bandas, músicas, setlists, bookings e contatos que nunca são removidos. Os e-mails únicos (`Date.now()` + random) evitam colisões, mas o banco cresce sem parar e os dados de teste se misturam aos dados usados no desenvolvimento manual.
- **Risco de LGPD e de integridade**: alguns testes manipulam o banco diretamente, por exemplo apagando usuários em `test/e2e/band/create.e2e-spec.ts`. Se o banco de dev receber um dump com dados reais de membros e contatos de bandas, a suíte passa a ler e alterar dados pessoais.
- **Falta de reprodutibilidade**: o resultado depende do estado do banco local (migrations aplicadas ou não, dados antigos). Isso também impede rodar a suíte em CI sem preparar um banco manualmente.

Um banco em memória (SQLite ou `pg-mem`) foi descartado porque as migrations usam recursos específicos do PostgreSQL (`timestamptz`, uuid e enums) e a emulação traria falsos positivos. A solução adotada é um PostgreSQL real e descartável por execução, via Testcontainers.

Como complemento, uma camada de **testes de componente** com repositórios em memória dá feedback rápido sobre a camada HTTP (validação, AuthN/AuthZ, contratos de resposta, códigos de erro) sem Docker. Ela não substitui o e2e.

## What Changes

- **Postgres efêmero para e2e**: adicionar `@testcontainers/postgresql` (devDependency). Um `globalSetup` do Jest e2e sobe um container `postgres:16-alpine` (a mesma imagem do `docker-compose.dev.yml`), roda as migrations reais de `src/infrastructure/typeorm/migrations/` e cria um banco isolado por worker do Jest a partir de um template. Um `globalTeardown` destrói o container.
- **Credenciais efêmeras**: as variáveis `DB_*` usadas pelos e2e passam a vir do container, com usuário e senha gerados a cada execução. `test/setEnvVars.js` passa a usar `??=` para as variáveis de banco, mantendo os valores atuais só como fallback dos testes unitários, que não abrem conexão.
- **Limpeza entre suites**: um helper `truncateAllTables` roda `TRUNCATE ... RESTART IDENTITY CASCADE` no `afterAll` de cada suite e2e, preservando a tabela `migrations`.
- **Nenhuma escrita no banco de dev**: com o container, os e2e deixam de se conectar ao `band_tools_db`.
- **(Complemento) Camada de testes de componente**: novo diretório `test/component/` com config Jest própria (`test/jest-component.json`) e script `npm run test:component`. Repositórios `InMemory*Repository` implementam as interfaces de `src/domain/repositories/` e substituem os repositórios TypeORM via `overrideModule`/`overrideProvider`, sem conexão com banco.
- **Refactor necessário para o complemento**: os repositórios de cada `*FactoryModule` são extraídos para módulos de persistência próprios (ex.: `BandPersistenceModule`), para que a camada de componente troque toda a persistência de uma vez sem o `TypeOrmModule`. O comportamento em runtime não muda.
- **Documentação**: atualizar `CLAUDE.md` (seção Testing e comandos) com o pré-requisito de Docker e o novo script.

## Capabilities

### New Capabilities
- `test-infrastructure`: define como as suítes automatizadas obtêm o banco de dados (e2e com PostgreSQL efêmero e isolado por worker) e como a camada de componente roda sem banco usando repositórios em memória.

### Modified Capabilities
(nenhuma, nenhum requisito funcional da API muda)

## Impact

- **Entidades do domínio**: Banda, Membro, Música, Setlist, Evento/Booking, Usuário e Contato não mudam. As interfaces de repositório em `src/domain/repositories/` também não mudam: elas passam a ter uma segunda implementação (em memória) usada só em testes.
- **Aplicação**: nenhum use case muda.
- **Infraestrutura**: nenhuma migration nova. As migrations existentes passam a ser exercitadas a cada execução do e2e em um banco vazio, o que também valida que `migration:run` funciona do zero. Para o complemento, extração de `*PersistenceModule` (wiring apenas).
- **HTTP**: os `*FactoryModule` passam a importar o módulo de persistência em vez de declarar os repositórios diretamente. Controllers, guards e DTOs não mudam.
- **Testes**: `test/jest-e2e.json` ganha `globalSetup`, `globalTeardown` e um `setupFiles` extra. As 13 suítes e2e ganham a chamada de limpeza no `afterAll`. Novos arquivos em `test/e2e/support/` e, no complemento, em `test/component/`.
- **Dependências**: `@testcontainers/postgresql` como devDependency, sem impacto no bundle de produção. Rodar `npm audit` após a instalação.
- **Ambiente**: `npm run test:e2e` passa a exigir Docker em execução (Docker Desktop com integração WSL, ou Docker Engine no WSL). O `docker-compose.dev.yml` deixa de ser necessário para os e2e. O repositório ainda não tem pipeline de CI, e o CI que vier a ser criado precisará de um runner com Docker.
- **Tempo de execução**: cerca de 3 a 5 segundos a mais por execução do e2e, para subir o container e rodar as migrations. A camada de componente roda em poucos segundos, sem Docker.
- **Segurança/LGPD**: os e2e deixam de ler e alterar o banco de dev e as credenciais de banco usadas pelos testes passam a ser efêmeras.
