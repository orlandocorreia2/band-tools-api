## ADDED Requirements

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
