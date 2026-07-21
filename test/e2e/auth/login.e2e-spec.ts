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

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

describe('POST /auth/login (e2e)', () => {
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

  const registerUser = async () => {
    const payload = validUserPayload();
    await request(app.getHttpServer()).post('/users').send(payload).expect(201);
    return payload;
  };

  it('should return 200 with an accessToken when credentials are valid', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.accessToken.length).toBeGreaterThan(0);
  });

  it('should return 401 when email does not exist', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'unknown.user@example.com', password: 'Password1' })
      .expect(401);
  });

  it('should return 401 when password is incorrect', async () => {
    const user = await registerUser();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'WrongPassword1' })
      .expect(401);
  });

  it('should return 422 when email is missing', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: 'Password1' })
      .expect(422);
  });

  it('should return 422 when password is missing', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john.lennon@example.com' })
      .expect(422);
  });

  it('should return 422 when email has an invalid format', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'Password1' })
      .expect(422);
  });

  it('should return 400 when body is malformed JSON', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ invalid-json')
      .expect(400);
  });
});
