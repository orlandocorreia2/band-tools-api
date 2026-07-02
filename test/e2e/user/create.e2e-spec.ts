import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { BaseException } from '@shared/exceptions/base.exception';
import { AppModule } from '../../../src/app.module';
import { ExceptionTypeEnum } from '@shared/commons/enums';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';

const uniqueEmail = () =>
  `john.lennon.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2)}@example.com`;

const validPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

describe('POST /users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (validationErrors) => {
          const errors = validationErrors.map((error) => ({
            field: error.property,
            detail: Object.values(error.constraints ?? {}).join(', '),
          }));

          return new BaseException({
            code: HttpStatus.UNPROCESSABLE_ENTITY,
            title: ExceptionTypeEnum.ClassValidator,
            detail: 'Validation failed',
            errors,
          });
        },
      }),
    );
    app.useGlobalFilters(new ExceptionFilterMiddleware());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 201 when payload is valid', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send(validPayload())
      .expect(201);
  });

  it('should return 422 when first_name is missing', async () => {
    const { first_name, ...rest } = validPayload();
    await request(app.getHttpServer()).post('/users').send(rest).expect(422);
  });

  it('should return 422 when email is missing', async () => {
    const { email, ...rest } = validPayload();
    await request(app.getHttpServer()).post('/users').send(rest).expect(422);
  });

  it('should return 422 when email has an invalid format', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ ...validPayload(), email: 'not-an-email' })
      .expect(422);
  });

  it('should return 422 when password is weaker than required', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ ...validPayload(), password: 'weak' })
      .expect(422);
  });

  it('should return 409 when email already exists', async () => {
    const payload = validPayload();

    await request(app.getHttpServer()).post('/users').send(payload).expect(201);

    await request(app.getHttpServer()).post('/users').send(payload).expect(409);
  });

  it('should return 400 when body is malformed JSON', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{ invalid-json')
      .expect(400);
  });
});
