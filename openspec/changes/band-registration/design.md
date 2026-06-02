## Context

The Band Tools API does not yet have a Band entity. This is the first domain module to be built and serves as the foundation for all future features (members, songs, rehearsals, events). The architecture follows Clean Architecture with the Repository Pattern, which drives the structural decisions below.

## Goals / Non-Goals

**Goals:**

- Create the `Band` entity in the domain layer with well-defined required and optional fields
- Create a versioned migration for the `bands` table
- Expose `POST /bands` with validation, Swagger documentation, and error handling
- Ensure 100% unit test coverage for all generated files and e2e coverage for the endpoint

**Non-Goals:**

- Listing or querying band records (belong to separate changes)
- Update or delete band records (belong to separate changes)
- Association of members to a band (belongs to a separate module)
- Image file upload or storage management (image is stored as a URL string only)
- Relationships with songs, rehearsals, or events
- Any form of querying or listing bands

## Decisions

### 1. `id`, `created_at`, and `updated_at` generated in `BaseEntity` constructor

**Decision:** The abstract `BaseEntity` is responsible for generating `id` (UUIDv7) and setting `created_at`/`updated_at` to `new Date()` in its constructor. `BandEntity` extends `BaseEntity` and only handles band-specific fields.  
**Reason:** Centralises identity and timestamp concerns in one place — every future domain entity inherits this behaviour for free without repeating the logic. UUIDv7 is time-ordered, improving PostgreSQL B-tree index performance. Generating inside the constructor enforces that no entity can ever exist without a valid identity.  
**Alternative considered:** Generating `id` in `BandEntity` — rejected for duplicating the responsibility across every future entity. `SERIAL` (auto-increment) — rejected for exposing sequence. UUIDv4 — rejected for poor index locality.

### 2. Soft delete with `deleted_at`

**Decision:** `deleted_at` field (nullable timestamp) is included in the schema for future soft delete support. No delete operation is exposed in this change.  
**Reason:** Preserves band history, facilitates auditing, and prevents accidental data loss.  
**Alternative considered:** Hard delete — rejected for making traceability impossible.

### 3. `BandGenreEnum` enum in shared layer, stored as plain string in the database

**Decision:** `genre` represented by a TypeScript enum (`BandGenreEnum`) defined in `src/shared/commons/enums/band.enum.ts` with well-known genres. Stored as plain `varchar` in the database.

`rock`, `alternative_rock`, `indie_rock`, `hard_rock`, `progressive_rock`, `psychedelic_rock`, `blues_rock`, `post_rock`, `grunge`, `punk`, `new_wave`, `metal`, `heavy_metal`, `doom_metal`, `gothic_metal`, `thrash_metal`, `death_metal`, `black_metal`, `pop`, `jazz`, `blues`, `classical`, `electronic`, `techno`, `house`, `ambient`, `hip_hop`, `r_and_b`, `funk`, `soul`, `disco`, `reggae`, `ska`, `country`, `folk`, `gospel`, `latin`, `samba`, `forro`, `bossa_nova`, `mpb`, `axe`, `pagode`, `trap`, `other`.  
**Reason:** Constrains input to a known set at the application level without locking the database schema to a fixed type. `other` covers edge cases without requiring schema changes.  
**Alternative considered:** Free-form string — rejected for allowing inconsistent and misspelled values.

### 4. `BandStatusEnum` enum in shared layer, stored as plain string in the database

**Decision:** `status` represented by a TypeScript enum (`active | inactive`) defined in `src/shared/commons/enums/band.enum.ts`. In the database, the column is mapped as a plain `varchar` — no PostgreSQL enum type.  
**Reason:** Storing as a plain string avoids `ALTER TYPE` migrations whenever new statuses are added. The TypeScript enum still enforces valid values at the application level via `class-validator`.  
**Alternative considered:** PostgreSQL native enum — rejected because adding new values requires a database migration even when the change is trivial at the application level.

### 5. `IBandRepository` interface in the domain layer

**Decision:** The domain defines the interface; `BandRepository` (TypeORM) implements it in `src/infrastructure/band`.  
**Reason:** Dependency inversion (SOLID-D) — use cases depend on abstraction, not on the ORM.

### 6. `CreateBandUseCaseInterface` injected into the controller via token + factory module

**Decision:** `BandController` receives the use case through `@Inject(BandFactoryModule.CREATE_BAND_USE_CASE)` typed as `CreateBandUseCaseInterface`. The concrete `CreateBandUseCase` is wired in `band-factory.module.ts` using a `useFactory` provider — following the same pattern as `HealthCheckFactoryModule`.  
**Reason:** Keeps the controller decoupled from the concrete implementation. The factory module centralises all dependency wiring for the band context, making it easy to swap implementations or mock in tests.  
**Alternative considered:** Injecting the concrete class directly — rejected for coupling the HTTP layer to the application layer implementation.

### 7. `image` as an optional URL string

**Decision:** `image` is stored as a plain URL string (nullable), with no file upload logic in this module.  
**Reason:** Keeps the module simple and decoupled from storage concerns. File upload can be handled by a dedicated media module in the future.  
**Alternative considered:** Multipart file upload — rejected as out of scope for this iteration.

### 8. `started_at` as a required field

**Decision:** `started_at` is required in the request and cannot be null.  
**Reason:** The formation date is considered essential information for band registration in this domain.

### 9. `execute` returns `Promise<void>`

**Decision:** `CreateBandUseCase.execute()` returns `Promise<void>`; the controller responds with HTTP 201 and no body.  
**Reason:** Band registration is a command with no query need at this stage. Keeping the response empty avoids coupling the HTTP layer to a response DTO.

### 10. TypeORM entity named `BandTypeormEntity` to avoid name conflict

**Decision:** The TypeORM entity is named `BandTypeormEntity` (at `src/infrastructure/database/entities/band/band-typeorm.entity.ts`) to distinguish it from the domain entity `BandEntity`.  
**Reason:** Having two classes named `BandEntity` in the same project causes ambiguity in imports and cognitive overhead.

## Risks / Trade-offs

- **[Trade-off] Soft delete `deleted_at` field present but unused in this change** → The column is created in the migration for future use; no delete operation is exposed yet. Mitigation: document clearly that the field is reserved for a future change.
