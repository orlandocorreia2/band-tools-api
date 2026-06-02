## Why

The application does not yet have a central Band entity, which is the core of the domain. Without this registration, no other functionality (members, songs, rehearsals, events) can be built on a solid foundation.

## What Changes

- Creation of abstract `BaseEntity` in the domain layer with `id` (UUIDv7), `created_at`, and `updated_at` generated in the constructor
- Creation of the `BandEntity` domain entity extending `BaseEntity` with fields: `name`, `genre`, `description`, `country`, `state`, `city`, `neighborhood`, `address`, `status`, `image`, `started_at`, `deleted_at`
- Creation of `BandGenreEnum` and `BandStatusEnum` in `src/shared/commons/enums/band.enum.ts`
- Creation of the `IBandRepository` repository interface in the domain layer
- Creation of `CreateBandUseCaseInterface` and `CreateBandUseCase` in the application layer
- Implementation of `BandTypeormEntity` and `BandRepository` in the infrastructure layer
- Creation of the migration for the `bands` table
- Exposure of REST endpoint:
  - `POST /bands` — register a band

## Capabilities

### New Capabilities

- `band-management`: Band registration — create a new band record in the `bands` table

### Modified Capabilities

## Impact

- New `BandFactoryModule` and `BandController` in `src/http/band/`
- New `BandTypeormEntity`, `BandRepository`, and migration in `src/infrastructure/database/`
- New `CreateBandUseCase` and `CreateBandUseCaseInterface` in `src/application/usecase/band/`
- New `BaseEntity` in `src/domain/entities/` and `BandEntity` in `src/domain/entities/band/`
- New `IBandRepository` in `src/domain/repositories/band/`
- New `CreateBandDto` in `src/shared/communication/dtos/band/`
- New `BandGenreEnum` and `BandStatusEnum` in `src/shared/commons/enums/`
- API documented via Swagger
