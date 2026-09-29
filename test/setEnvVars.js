import 'reflect-metadata';

process.env.SERVICE_NAME = 'band-tools';
process.env.PORT = '3000';
process.env.STAGE = 'development';
// DB_* use ??= so the e2e global setup (ephemeral Testcontainers PostgreSQL) takes precedence.
// Unit tests never open a connection, so these fallbacks are placeholders only.
process.env.DB_HOST ??= 'localhost';
process.env.DB_PORT ??= '5432';
process.env.DB_USER ??= 'band_tools_unit';
process.env.DB_PASSWORD ??= 'unit-test-placeholder'; // NOSONAR - not a real credential
process.env.DB_NAME ??= 'band_tools_unit';
process.env.DB_TYPE = 'postgres';
process.env.DB_SYNCHRONIZE = 'false';
process.env.DB_AUTO_LOAD_ENTITIES = 'true';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '3600';
