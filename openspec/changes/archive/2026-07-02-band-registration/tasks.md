## 1. Domain

- [x] 1.1 Create `BandStatusEnum` enum at `src/shared/commons/enums/band.enum.ts`; values: `Active`, `Inactive`. `genre` is a free-form string — no dedicated enum
- [x] 1.2 Create abstract `BaseEntity` at `src/domain/entities/base.entity.ts` with `id`, `created_at`, and `updated_at` fields; all set in the constructor — `id` generated as UUIDv7, `created_at` and `updated_at` set to `new Date()`
- [x] 1.3 Create `BandEntity` at `src/domain/entities/band/band.entity.ts` extending `BaseEntity`; constructor receives a typed props object with all required fields (`name`, `genre`, `state`, `city`, `neighborhood`, `address`, `started_at`, `status`) and optional fields (`description`, `image`) and assigns each to its property; `id`, `created_at`, and `updated_at` are set by calling `super()`
- [x] 1.4 Create `IBandRepository` interface at `src/domain/repositories/band/band.repository.interface.ts` with method signature `save(band: BandEntity): Promise<void>`

## 2. DTOs

- [x] 2.1 Create `CreateBandDto` at `src/shared/communication/dtos/band/create-band.dto.ts` with the following fields and decorators:
  - `name`: `@IsString() @MinLength(3)` — required
  - `genre`: `@IsString() @MinLength(1)` — required, free-form string (no fixed catalog/enum)
  - `state`: `@IsString() @MinLength(1)` — required
  - `city`: `@IsString() @MinLength(1)` — required
  - `neighborhood`: `@IsString() @MinLength(1)` — required
  - `address`: `@IsString() @MinLength(1)` — required
  - `started_at`: `@IsDate() @Type(() => Date)` — required
  - `status`: `@IsEnum(BandStatusEnum)` — required
  - `description`: `@IsOptional() @IsString()` — optional
  - `image`: `@IsOptional() @IsString()` — optional
  - All fields documented with `@ApiProperty` / `@ApiPropertyOptional`

## 3. Use Case

- [x] 3.1 Create `CreateBandUseCaseInterface` at `src/application/usecase/band/interfaces/create-band.usecase.interface.ts` with method signature `execute(dto: CreateBandDto): Promise<void>`
- [x] 3.2 Create `CreateBandUseCase` at `src/application/usecase/band/create-band.usecase.ts` implementing `CreateBandUseCaseInterface`; constructor receives `IBandRepository` via dependency injection; main method named `execute`

## 4. Infrastructure

- [x] 4.1 Create `BandTypeormEntity` at `src/infrastructure/database/entities/band/band-typeorm.entity.ts` mapping all fields to the database (named `BandTypeormEntity` to avoid conflict with the domain `BandEntity`)
- [x] 4.2 Create `BandRepository` at `src/infrastructure/database/repositories/band/band.repository.ts` implementing `IBandRepository`
- [x] 4.3 Generate migration with `npm run migration:generate -- --name=create-bands-table`; ensure `status` column has `DEFAULT 'active'` and `genre` column has `DEFAULT 'Heavy Metal'` in the generated SQL; no `country` column
- [x] 4.4 Run the migration with `npm run migration:run` and validate the table in the database

## 5. HTTP Layer

- [x] 5.1 Create `BandController` at `src/http/band/band.controller.ts` with endpoint `POST /bands` decorated with `@HttpCode(HttpStatus.CREATED)`; inject the use case via `@Inject(BandFactoryModule.CREATE_BAND_USE_CASE)` typed as `CreateBandUseCaseInterface`
- [x] 5.2 Create `BandFactoryModule` at `src/http/band/band-factory.module.ts` following the `HealthCheckFactoryModule` pattern; `useFactory` receives `BandRepository` via `inject` and passes it as constructor argument to `new CreateBandUseCase(bandRepository)`
- [x] 5.3 Import `BandFactoryModule.forRoot()` in `AppModule`
- [x] 5.4 Add Swagger decorators to the controller:
  - `@ApiTags('bands')`
  - `@ApiOperation({ summary: 'Register a new band' })`
  - `@ApiResponse({ status: 201, description: 'Band created successfully' })`
  - `@ApiResponse({ status: 422, description: 'Unprocessable Entity — validation failed' })`
  - `@ApiResponse({ status: 500, description: 'Internal Server Error' })`

## 6. Unit Tests

- [x] 6.1 Write unit tests for `BaseEntity` — assert `created_at` and `updated_at` are set to the current date on instantiation
- [x] 6.2 Write unit tests for `BandEntity` — assert all fields are correctly assigned via constructor, `id` is generated as UUIDv7, and `created_at`/`updated_at` are inherited from `BaseEntity`
- [x] 6.3 Write unit tests for `CreateBandUseCase` — mock `IBandRepository`, assert `save` is called with a `BandEntity` instance and `execute` returns `void`
- [x] 6.4 Write unit tests for `BandRepository` — mock TypeORM `DataSource`/`Repository`, assert `save` persists the entity and maps correctly to domain
- [x] 6.5 Write unit tests for `BandController` — mock `CreateBandUseCaseInterface`, assert `POST /bands` calls `execute` and returns HTTP 201 with no body
- [x] 6.6 Write unit tests for `CreateBandDto` — use `class-validator` `validate()` to assert each required field, including `genre`, fails when absent and each validation rule is enforced (min length, date)
- [x] 6.7 Verify 100% coverage for all files above with `npm run test:cov`

## 7. E2E Tests

- [x] 7.1 Write e2e tests for `POST /bands` (scenarios: success, missing required field including `genre`, invalid status)
