import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';

const uniqueEmail = () =>
  `band.owner.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const validPayload = () => ({
  name: 'Nome da Banda',
  genre: 'Heavy Metal',
  state: 'São Paulo',
  city: 'São Paulo',
  neighborhood: 'Centro',
  address: 'Avenida Paulista, 1000',
  started_at: '2026-06-01',
  description: 'Descrição da Banda',
});

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('POST /bands (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;

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
    await app.close();
  });

  it('should return 201 when payload is valid and a valid token is provided', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validPayload())
      .expect(201);
  });

  it('should link the authenticated user as owner in band_members', async () => {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    const bandMemberRepository = dataSource.getRepository(
      BandMemberTypeormEntity,
    );

    const ownedMemberships = await bandMemberRepository.find({
      where: { user_id: userId, is_owner: true },
    });

    expect(ownedMemberships.length).toBeGreaterThanOrEqual(1);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const userPayload = validUserPayload();
    await request(app.getHttpServer())
      .post('/users')
      .send(userPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    const deletedUserToken: string = loginResponse.body.accessToken;
    const deletedUserId = decodeUserIdFromToken(deletedUserToken);

    const dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: deletedUserId });

    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${deletedUserToken}`)
      .send(validPayload())
      .expect(404);
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .send(validPayload())
      .expect(401);
  });

  it('should return 401 when token is invalid', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', 'Bearer invalid-token')
      .send(validPayload())
      .expect(401);
  });

  it('should return 400 when name is missing', async () => {
    const { name, ...rest } = validPayload();
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(400);
  });

  it('should return 400 when name is shorter than 3 characters', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validPayload(), name: 'AB' })
      .expect(400);
  });

  it('should return 400 when genre is missing', async () => {
    const { genre, ...rest } = validPayload();
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(400);
  });

  it('should return 400 when started_at is missing', async () => {
    const { started_at, ...rest } = validPayload();
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(400);
  });
});
