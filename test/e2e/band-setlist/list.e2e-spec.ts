import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = () => `band.setlist.list.${uniqueSuffix()}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const uniqueBandName = () => `Band Setlist List E2E ${uniqueSuffix()}`;

const validBandPayload = (name: string) => ({
  name,
  genre: 'Heavy Metal',
  state: 'São Paulo',
  city: 'São Paulo',
  neighborhood: 'Centro',
  address: 'Avenida Paulista, 1000',
  started_at: '2026-06-01',
});

const validSetlistPayload = (name: string) => ({ name });

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('GET /bands/:id/setlists (e2e)', () => {
  let app: INestApplication;

  const registerAndLogin = async (): Promise<{
    accessToken: string;
    userId: string;
  }> => {
    const userPayload = validUserPayload();
    await request(app.getHttpServer())
      .post('/users')
      .send(userPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    const token: string = loginResponse.body.accessToken;
    return { accessToken: token, userId: decodeUserIdFromToken(token) };
  };

  const createBand = async (accessToken: string): Promise<string> => {
    const bandName = uniqueBandName();
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBandPayload(bandName))
      .expect(201);

    const dataSource = app.get<DataSource>(getDataSourceToken());
    const band = await dataSource
      .getRepository(BandTypeormEntity)
      .findOneBy({ name: bandName });
    return band.id;
  };

  const createSetlist = async (
    accessToken: string,
    bandId: string,
    name: string,
  ): Promise<void> => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validSetlistPayload(name))
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

  it('should return 200 with the setlists of the band, wrapped in data', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);

    await createSetlist(owner.accessToken, bandId, 'Show de Sábado');
    await createSetlist(owner.accessToken, bandId, 'Show Acústico');

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const names: string[] = response.body.data.map(
      (setlist: { name: string }) => setlist.name,
    );
    expect(names).toEqual(
      expect.arrayContaining(['Show de Sábado', 'Show Acústico']),
    );
    expect(names).toHaveLength(2);
  });

  it('should return 200 with an empty data array when the band has no setlists', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('should not include setlists belonging to other bands', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const otherBandId = await createBand(owner.accessToken);
    await createSetlist(owner.accessToken, otherBandId, 'Another Band Setlist');

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const names: string[] = response.body.data.map(
      (setlist: { name: string }) => setlist.name,
    );
    expect(names).not.toContain('Another Band Setlist');
  });

  it('should return 404 when the band does not exist', async () => {
    const owner = await registerAndLogin();

    await request(app.getHttpServer())
      .get('/bands/00000000-0000-7000-8000-000000000000/setlists')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(404);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const member = await registerAndLogin();

    const dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: member.userId });

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(404);
  });

  it('should return 403 when the authenticated user is not a member of the band', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const outsider = await registerAndLogin();

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(403);
  });

  it('should return 401 when no token is provided', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists`)
      .expect(401);
  });
});
