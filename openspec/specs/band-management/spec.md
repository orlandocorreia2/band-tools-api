# band-management Specification

## Purpose
TBD - created by archiving change band-member-ownership. Update Purpose after archive.
## Requirements
### Requirement: Create band
The system SHALL allow registering a new band with the following fields and validations:

**Required fields:**
- `name`: string, minimum 3 characters
- `genre`: free-form string, minimum 1 character (no fixed catalog/enum)
- `state`: string, minimum 1 character
- `city`: string, minimum 1 character
- `neighborhood`: string, minimum 1 character
- `address`: string, minimum 1 character
- `started_at`: valid date
- `status`: must be a valid `BandStatusEnum` value

**Optional fields:**
- `description`: string
- `image`: string (URL)

All validations SHALL be enforced via `class-validator` decorators on the DTO and documented via Swagger (`@ApiProperty`).

The system SHALL identify the authenticated user making the request (from the JWT payload attached by `JwtAuthGuard`) and SHALL verify that this user still exists in the `users` table before creating the band. If the user cannot be found, the system SHALL return HTTP status 404 and SHALL NOT persist the band. If the user exists, the system SHALL, in the same database transaction as the band creation, create a corresponding `band_members` record linking that user to the newly created band with `is_owner = true`. If the membership record cannot be created, the band creation SHALL be rolled back as well.

#### Scenario: Registration with all valid data
- **WHEN** a `POST /bands` request is sent with all required fields passing their validations
- **THEN** the system SHALL persist the band with a generated `id` (UUIDv7), `created_at` and `updated_at` filled automatically, and return HTTP status 201 with no body

#### Scenario: Registration with malformed request body
- **WHEN** a `POST /bands` request is sent with an unparseable body (e.g. invalid JSON)
- **THEN** the system SHALL return HTTP status 400

#### Scenario: Registration without a required field
- **WHEN** a `POST /bands` request is sent with any required field missing
- **THEN** the system SHALL return HTTP status 422 with an error message identifying the missing field

#### Scenario: Registration with name shorter than 3 characters
- **WHEN** a `POST /bands` request is sent with `name` containing fewer than 3 characters
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Registration with missing genre
- **WHEN** a `POST /bands` request is sent with `genre` missing or empty
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Registration with invalid status
- **WHEN** a `POST /bands` request is sent with a `status` outside the allowed `BandStatusEnum` values
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Registration with invalid started_at
- **WHEN** a `POST /bands` request is sent with `started_at` that is not a valid date
- **THEN** the system SHALL return HTTP status 422 with a validation error message

#### Scenario: Authenticated user is automatically linked as owner
- **WHEN** a `POST /bands` request is sent by an authenticated user (valid JWT) with all required fields passing their validations
- **THEN** the system SHALL create a `band_members` record with the authenticated user's `id`, the newly created band's `id`, and `is_owner = true`

#### Scenario: Membership creation failure rolls back the band
- **WHEN** a `POST /bands` request passes all validations but the `band_members` insert fails for any reason
- **THEN** the system SHALL NOT persist the band either, returning HTTP status 500

#### Scenario: Authenticated user no longer exists
- **WHEN** a `POST /bands` request is sent with a structurally valid JWT (correct signature, not expired) whose subject (`sub`) no longer matches any record in `users`
- **THEN** the system SHALL return HTTP status 404 and SHALL NOT persist the band
