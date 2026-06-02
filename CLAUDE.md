# Band Tools API

Backend application for managing musical bands. Allows registering and administering bands, members, songs, rehearsals, events, and other resources related to the band universe.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** NestJS (Fastify as HTTP platform)
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **API Documentation:** Swagger / OpenAPI (`@nestjs/swagger` + `@scalar/nestjs-api-reference`)
- **Validation:** `class-validator` + `class-transformer`
- **Tests:** Jest (unit + e2e with Supertest)
- **Linting / Formatting:** ESLint + Prettier
- **Git hooks:** Husky + Commitlint

## Architecture

The project follows a layered architecture inspired by Clean Architecture / Domain-Driven Design:

```
src/
├── domain/           # Pure business entities and rules — no framework dependency
├── application/      # Use cases that orchestrate business logic
├── infrastructure/   # Concrete implementations: TypeORM entities, repositories, migrations
│   ├── entities/     # TypeORM entities (suffixed BandTypeormEntity to avoid name clash)
│   ├── repository/   # IBandRepository implementations
│   └── typeorm/      # DataSource, TypeormModule, migrations
├── http/             # Controllers, middlewares, NestJS HTTP layer
│   ├── band/         # BandController + BandFactoryModule
│   ├── health-check/ # HealthCheckController + HealthCheckFactoryModule
│   └── middlewares/  # ExceptionFilterMiddleware, TrimStringsMiddleware
└── shared/           # Cross-cutting: DTOs, enums, exceptions, helpers, config
    ├── commons/      # Enums (BandGenreEnum, BandStatusEnum), OpenAPI helpers
    ├── communication/dtos/  # Request/response DTOs with class-validator decorators
    ├── config/       # EnvConfigModule, EnvConfigService, env validation
    ├── exceptions/   # BaseException, BusinessException
    └── helpers/      # Error messages map
```

## Design Patterns

### SOLID
All principles are applied:
- **S** — Single responsibility per class
- **O** — Open for extension, closed for modification
- **L** — Liskov substitution
- **I** — Interface segregation
- **D** — Dependency inversion

### Repository Pattern
Data access is abstracted by repository interfaces defined in the domain layer (`src/domain/repositories/`) and implemented in the infrastructure layer (`src/infrastructure/repository/`). Use cases depend only on the interface, never on TypeORM directly.

### Object Calisthenics
- One level of indentation per method
- No `else` usage
- Primitive wrapping in domain types (value objects)
- Collections encapsulated in their own classes
- Max two attributes per class where possible
- No abbreviations in names

### Migrations
All schema changes are made exclusively via versioned TypeORM migrations in `src/infrastructure/typeorm/migrations/`.

- Never use `synchronize: true` in production
- Generate: `npm run migration:generate -- --name=<name>`
- Run: `npm run migration:run`
- Revert: `npm run migration:revert`

## Development Workflow

The project adopts **SDD (Specification-Driven Development)** combined with **TDD (Test-Driven Development)**:

1. **Spec first** — every change starts with a proposal and design documented via OpenSpec (`/opsx:propose`) before any code is written
2. **Red** — write the test that validates the expected behavior (initially fails)
3. **Green** — implement the minimum necessary to make the test pass
4. **Refactor** — improve the code keeping tests green and respecting SOLID + Object Calisthenics
5. **Commit** — following Conventional Commits only after all tests pass

## Conventions

### Commits
Follow **Conventional Commits** (commitlint + Husky).

### Enums
Enum values use **PascalCase with spaces** (e.g. `'Rock'`, `'Alternative Rock'`, `'Hip Hop'`, `'Active'`, `'Inactive'`). Exception: well-known acronyms keep their canonical form (`'MPB'`, `'R And B'`).

### HTTP Error Codes
- **400** — malformed request body (Fastify native)
- **422** — DTO validation failure (class-validator via `ValidationPipe` `exceptionFactory`)
- **500** — unhandled internal errors

All errors flow through `ExceptionFilterMiddleware` (global `@Catch()` filter) and return the shape `{ error, message, errors[] }`.

### Module Organization
- NestJS modules organized by domain/feature
- Factory modules (`*FactoryModule`) centralize all provider wiring using `useFactory`; controllers inject use case interfaces via token — never the concrete class
- DTOs use explicit `class-validator` decorators; `ValidationPipe` is configured with `transform: true` and `whitelist: true`

### Environment Variables
Managed with `dotenv` + `@nestjs/config`. All variables are validated at startup via `env-config.validation.ts` (`class-validator` + `plainToInstance`). Docker Compose is used for the local development environment (`docker-compose.dev.yml`).

### Testing
- **Unit tests:** `test/unit/` — 100% coverage required (statements, branches, functions, lines)
- **e2e tests:** `test/` (`*.e2e-spec.ts`) — uses Supertest against a real NestJS app
- Jest config: `jest.config.ts` (unit), `test/jest-e2e.json` (e2e)
- `emitDecoratorMetadata: false` in the Jest tsconfig — barrel files that only re-export types need a side-effect import (`import '@module/interfaces'`) in a dedicated spec to be counted in coverage

## Useful Commands

```bash
# Development
npm run start:dev

# Tests
npm run test           # unit tests
npm run test:e2e       # e2e tests
npm run test:cov       # unit tests with coverage

# Migrations
npm run migration:generate -- --name=<name>
npm run migration:run
npm run migration:revert

# Docker
npm run docker:dev
```
