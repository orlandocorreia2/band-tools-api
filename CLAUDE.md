# Band Tools API

Aplicação backend voltada para o gerenciamento de bandas musicais. Permite cadastrar e administrar bandas, membros, músicas, ensaios, eventos e demais recursos relacionados ao universo de bandas.

## Tech Stack

- Runtime: Node.js com TypeScript
- Framework: NestJS (com Fastify como plataforma HTTP)
- ORM: TypeORM
- Banco de dados: PostgreSQL
- Documentação de API: Swagger / OpenAPI (`@nestjs/swagger` + `@scalar/nestjs-api-reference`)
- Validação: `class-validator` + `class-transformer`
- Testes: Jest (unitário + e2e com Supertest)
- Linting/Formatação: ESLint + Prettier
- Git hooks: Husky + Commitlint

## Arquitetura

O projeto segue uma arquitetura em camadas inspirada em Clean Architecture / Domain-Driven Design:

- `src/domain/` — Entidades e regras de negócio puras, sem dependência de frameworks
- `src/application/` — Casos de uso (use cases) que orquestram a lógica de negócio
- `src/infrastructure/` — Implementações concretas: banco de dados, migrations, repositórios TypeORM
- `src/http/` — Controllers, middlewares e camada de entrada HTTP (NestJS)
- `src/shared/` — Utilitários compartilhados: DTOs de comunicação, exceções, helpers, enums, interfaces

## Padrões de Projeto

### SOLID
Todos os princípios são aplicados:
- **S** — Responsabilidade única por classe
- **O** — Aberto para extensão, fechado para modificação
- **L** — Substituição de Liskov
- **I** — Segregação de interfaces
- **D** — Inversão de dependência

### Repository Pattern
Acesso a dados abstraído por interfaces de repositório definidas no domínio e implementadas na camada de infraestrutura. Casos de uso dependem apenas da interface, nunca do TypeORM diretamente.

### Object Calisthenics
Regras de qualidade de código aplicadas:
- Um nível de indentação por método
- Sem uso de `else`
- Wrapping de primitivos em tipos de domínio (value objects)
- Coleções encapsuladas em classes próprias
- Limite de dois atributos por classe onde possível
- Sem abreviações em nomes

### Migrations
Toda alteração de schema do banco de dados é feita exclusivamente via migrations TypeORM versionadas em `src/infrastructure/database/migrations/`.

- Nunca usar `synchronize: true` em produção
- Gerar: `npm run migration:generate -- --name=<nome>`
- Executar: `npm run migration:run`
- Reverter: `npm run migration:revert`

## Fluxo de Desenvolvimento

O projeto adota **SDD (Specification-Driven Development)** combinado com **TDD (Test-Driven Development)**:

1. **Spec first** — toda mudança começa com proposta e design documentados via OpenSpec (`/opsx:propose`) antes de qualquer linha de código
2. **Red** — escrever o teste que valida o comportamento esperado (falha inicialmente)
3. **Green** — implementar o mínimo necessário para o teste passar
4. **Refactor** — melhorar o código mantendo os testes verdes e respeitando SOLID + Object Calisthenics
5. **Commit** — seguindo Conventional Commits apenas após todos os testes passarem

## Padrões e Convenções

- Commits seguem o padrão **Conventional Commits** (commitlint + Husky)
- Módulos NestJS organizados por domínio/funcionalidade
- DTOs com validação explícita via `class-validator`
- Variáveis de ambiente gerenciadas com `dotenv` + `@nestjs/config`
- Docker Compose para ambiente de desenvolvimento local (`docker-compose.dev.yml`)

## Comandos Úteis

```bash
# Desenvolvimento
npm run start:dev

# Testes
npm run test
npm run test:e2e
npm run test:cov

# Migrations
npm run migration:generate -- --name=<nome>
npm run migration:run
npm run migration:revert

# Docker
npm run docker:dev
```
