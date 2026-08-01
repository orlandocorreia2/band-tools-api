import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band-member/band-member-typeorm.entity';

const uniqueEmail = (label: string) =>
  `band.list.${label}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

const validUserPayload = (label: string) => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(label),
  phone: '11912345678',
  password: 'Password1',
});

const validBandPayload = (name: string) => ({
  name,
  genre: 'Heavy Metal',
  state: 'São Paulo',
  city: 'São Paulo',
  neighborhood: 'Centro',
  address: 'Avenida Paulista, 1000',
  started_at: '2026-06-01',
});

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('GET /bands (e2e)', () => {
  let app: INestApplication;

  const registerAndLogin = async (
    label: string,
  ): Promise<{ accessToken: string; userId: string }> => {
    const userPayload = validUserPayload(label);
    await request(app.getHttpServer())
      .post('/users')
      .send(userPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    const accessToken: string = loginResponse.body.accessToken;
    return { accessToken, userId: decodeUserIdFromToken(accessToken) };
  };

  const createBand = async (
    accessToken: string,
    name: string,
  ): Promise<void> => {
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBandPayload(name))
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
    await app.close();
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer()).get('/bands').expect(401);
  });

  it('should return 200 with an empty data array when the user has no bands', async () => {
    const user = await registerAndLogin('empty');

    const response = await request(app.getHttpServer())
      .get('/bands')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('should return owned bands and bands the user is a member of, excluding other users bands', async () => {
    const userA = await registerAndLogin('owner');
    const userB = await registerAndLogin('member');

    await createBand(userA.accessToken, 'Band Owned By A');
    await createBand(userB.accessToken, 'Band Owned By B');

    const dataSource = app.get<DataSource>(getDataSourceToken());
    const bandMemberRepository = dataSource.getRepository(
      BandMemberTypeormEntity,
    );

    const bandOwnedByB = await bandMemberRepository.findOneBy({
      user_id: userB.userId,
      is_owner: true,
    });

    await bandMemberRepository.save(
      bandMemberRepository.create({
        band_id: bandOwnedByB.band_id,
        user_id: userA.userId,
        is_owner: false,
      }),
    );

    const response = await request(app.getHttpServer())
      .get('/bands')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const names: string[] = response.body.data.map(
      (band: { name: string }) => band.name,
    );
    expect(names).toEqual(
      expect.arrayContaining(['Band Owned By A', 'Band Owned By B']),
    );
    expect(names).toHaveLength(2);
  });

  it('should not include bands the user has no membership record for', async () => {
    const userA = await registerAndLogin('isolated-a');
    const userC = await registerAndLogin('isolated-c');

    await createBand(userC.accessToken, 'Band Only Owned By C');

    const response = await request(app.getHttpServer())
      .get('/bands')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .expect(200);

    const names: string[] = response.body.data.map(
      (band: { name: string }) => band.name,
    );
    expect(names).not.toContain('Band Only Owned By C');
  });
});
