import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { truncateAllTables } from '../support/database-cleaner';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = (label: string) =>
  `contact.list.${label}.${uniqueSuffix()}@example.com`;

const validUserPayload = (label: string) => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(label),
  phone: '11912345678',
  password: 'Password1',
});

const validContactPayload = (name: string) => ({
  name,
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

describe('GET /users/contacts (e2e)', () => {
  let app: INestApplication;

  const registerAndLogin = async (label: string): Promise<string> => {
    const userPayload = validUserPayload(label);
    await request(app.getHttpServer())
      .post('/users')
      .send(userPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    return loginResponse.body.accessToken;
  };

  const createContact = async (
    accessToken: string,
    name: string,
  ): Promise<void> => {
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validContactPayload(name))
      .expect(201);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new ExceptionFilterMiddleware());
    await app.init();
  });

  afterAll(async () => {
    await truncateAllTables(app.get(getDataSourceToken()));
    await app.close();
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer()).get('/users/contacts').expect(401);
  });

  it('should return 200 with an empty data array when the user has no contacts', async () => {
    const accessToken = await registerAndLogin('empty');

    const response = await request(app.getHttpServer())
      .get('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('should return only the contacts created by the authenticated user', async () => {
    const accessTokenA = await registerAndLogin('owner');
    const accessTokenB = await registerAndLogin('other');

    await createContact(accessTokenA, `Contact A ${uniqueSuffix()}`);
    const contactBName = `Contact B ${uniqueSuffix()}`;
    await createContact(accessTokenB, contactBName);

    const response = await request(app.getHttpServer())
      .get('/users/contacts')
      .set('Authorization', `Bearer ${accessTokenA}`)
      .expect(200);

    const names: string[] = response.body.data.map(
      (contact: { name: string }) => contact.name,
    );
    expect(names).not.toContain(contactBName);
    expect(names).toHaveLength(1);
  });

  it('should return contacts ordered from the most recent to the oldest', async () => {
    const accessToken = await registerAndLogin('ordered');
    const firstName = `First Contact ${uniqueSuffix()}`;
    const secondName = `Second Contact ${uniqueSuffix()}`;

    await createContact(accessToken, firstName);
    await createContact(accessToken, secondName);

    const response = await request(app.getHttpServer())
      .get('/users/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const names: string[] = response.body.data.map(
      (contact: { name: string }) => contact.name,
    );
    expect(names[0]).toBe(secondName);
    expect(names[1]).toBe(firstName);
  });
});
