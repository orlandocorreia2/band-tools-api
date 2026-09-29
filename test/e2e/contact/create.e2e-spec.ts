import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { truncateAllTables } from '../support/database-cleaner';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { ContactTypeormEntity } from '@infrastructure/entities/contact/contact-typeorm.entity';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { BaseException } from '@shared/exceptions/base.exception';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = () => `user.contact.${uniqueSuffix()}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const uniqueContactName = () => `Maria Souza ${uniqueSuffix()}`;

const validContactPayload = (name: string) => ({
  name,
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('POST /users/contacts (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;

  const findContactByName = async (name: string) => {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    return dataSource.getRepository(ContactTypeormEntity).findOneBy({ name });
  };

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

    const userPayload = validUserPayload();
    await request(app.getHttpServer())
      .post('/users')
      .send(userPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
    userId = decodeUserIdFromToken(accessToken);
  });

  afterAll(async () => {
    await truncateAllTables(app.get(getDataSourceToken()));
    await app.close();
  });

  it('should return 201 and persist the contact when only required fields are provided', async () => {
    const name = uniqueContactName();
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validContactPayload(name))
      .expect(201);

    const contact = await findContactByName(name);
    expect(contact).not.toBeNull();
    expect(contact.user_id).toBe(userId);
  });

  it('should persist optional fields when provided', async () => {
    const name = uniqueContactName();
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validContactPayload(name),
        alternate_phone: '1133654321',
        notes: 'Prefere contato via WhatsApp',
      })
      .expect(201);

    const contact = await findContactByName(name);
    expect(contact.alternate_phone).toBe('1133654321');
    expect(contact.notes).toBe('Prefere contato via WhatsApp');
  });

  it('should persist optional fields as null when not provided', async () => {
    const name = uniqueContactName();
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validContactPayload(name))
      .expect(201);

    const contact = await findContactByName(name);
    expect(contact.alternate_phone).toBeNull();
    expect(contact.notes).toBeNull();
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer())
      .post('/users/contacts')
      .send(validContactPayload(uniqueContactName()))
      .expect(401);
  });

  it('should return 401 when token is invalid', async () => {
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', 'Bearer invalid-token')
      .send(validContactPayload(uniqueContactName()))
      .expect(401);
  });

  it('should return 422 when name is missing', async () => {
    const { name, ...rest } = validContactPayload(uniqueContactName());
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when phone is missing', async () => {
    const { phone, ...rest } = validContactPayload(uniqueContactName());
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when phone is not a valid Brazilian phone number', async () => {
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validContactPayload(uniqueContactName()),
        phone: '123',
      })
      .expect(422);
  });

  it('should return 422 when venue_name is missing', async () => {
    const { venue_name, ...rest } = validContactPayload(uniqueContactName());
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when address is missing', async () => {
    const { address, ...rest } = validContactPayload(uniqueContactName());
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when email is missing', async () => {
    const { email, ...rest } = validContactPayload(uniqueContactName());
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when email is not a valid email address', async () => {
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validContactPayload(uniqueContactName()),
        email: 'not-an-email',
      })
      .expect(422);
  });

  it('should return 422 when role is missing', async () => {
    const { role, ...rest } = validContactPayload(uniqueContactName());
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });
});
