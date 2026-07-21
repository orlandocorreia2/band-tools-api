import 'reflect-metadata';

process.env.SERVICE_NAME = 'band-tools';
process.env.PORT = '3000';
process.env.STAGE = 'development';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'band_tools';
process.env.DB_PASSWORD = 'band_tools'; // NOSONAR - test credentials only
process.env.DB_NAME = 'band_tools_db';
process.env.DB_TYPE = 'postgres';
process.env.DB_SYNCHRONIZE = 'false';
process.env.DB_AUTO_LOAD_ENTITIES = 'true';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '3600';
