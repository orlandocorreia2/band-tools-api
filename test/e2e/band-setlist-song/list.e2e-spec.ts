import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band/band-setlist-typeorm.entity';
import { BandSongTypeormEntity } from '@infrastructure/entities/band/band-song-typeorm.entity';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = () =>
  `band.setlist.song.list.${uniqueSuffix()}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const uniqueBandName = () => `Band Setlist Song List E2E ${uniqueSuffix()}`;

const validBandPayload = (name: string) => ({
  name,
  genre: 'Heavy Metal',
  state: 'São Paulo',
  city: 'São Paulo',
  neighborhood: 'Centro',
  address: 'Avenida Paulista, 1000',
  started_at: '2026-06-01',
});

const uniqueSetlistName = () => `Show de Sábado ${uniqueSuffix()}`;

const validSetlistPayload = (name: string) => ({ name });

const uniqueSongTitle = () => `Come As You Are ${uniqueSuffix()}`;

const validSongPayload = (title: string) => ({ title });

const validAddSongPayload = (bandSongId: string, position: number) => ({
  bandSongId,
  position,
});

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('GET /bands/:id/setlists/:setlistId/songs (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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

    const band = await dataSource
      .getRepository(BandTypeormEntity)
      .findOneBy({ name: bandName });
    return band.id;
  };

  const createSetlist = async (
    accessToken: string,
    bandId: string,
  ): Promise<string> => {
    const name = uniqueSetlistName();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validSetlistPayload(name))
      .expect(201);

    const setlist = await dataSource
      .getRepository(BandSetlistTypeormEntity)
      .findOneBy({ name });
    return setlist.id;
  };

  const createSong = async (
    accessToken: string,
    bandId: string,
  ): Promise<{ id: string; title: string }> => {
    const title = uniqueSongTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validSongPayload(title))
      .expect(201);

    const song = await dataSource
      .getRepository(BandSongTypeormEntity)
      .findOneBy({ title });
    return { id: song.id, title: song.title };
  };

  const addSongToSetlist = async (
    accessToken: string,
    bandId: string,
    setlistId: string,
    bandSongId: string,
    position: number,
  ): Promise<void> => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId, position))
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

    dataSource = app.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with the setlist songs, wrapped in data and ordered by position ascending', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const setlistId = await createSetlist(owner.accessToken, bandId);
    const firstSong = await createSong(owner.accessToken, bandId);
    const secondSong = await createSong(owner.accessToken, bandId);

    await addSongToSetlist(
      owner.accessToken,
      bandId,
      setlistId,
      secondSong.id,
      2,
    );
    await addSongToSetlist(
      owner.accessToken,
      bandId,
      setlistId,
      firstSong.id,
      1,
    );

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      band_setlist_id: setlistId,
      band_song_id: firstSong.id,
      position: 1,
      title: firstSong.title,
    });
    expect(response.body.data[0].id).toEqual(expect.any(String));
    expect(response.body.data[0].created_at).toBeDefined();
    expect(response.body.data[0].updated_at).toBeDefined();
    expect(response.body.data[1]).toMatchObject({
      band_setlist_id: setlistId,
      band_song_id: secondSong.id,
      position: 2,
      title: secondSong.title,
    });
  });

  it('should return 200 with an empty data array when the setlist has no songs', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const setlistId = await createSetlist(owner.accessToken, bandId);

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('should return 404 when the band does not exist', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const setlistId = await createSetlist(owner.accessToken, bandId);

    await request(app.getHttpServer())
      .get(
        `/bands/00000000-0000-7000-8000-000000000000/setlists/${setlistId}/songs`,
      )
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(404);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const setlistId = await createSetlist(owner.accessToken, bandId);
    const member = await registerAndLogin();

    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: member.userId });

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(404);
  });

  it('should return 403 when the authenticated user is not a member of the band', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const setlistId = await createSetlist(owner.accessToken, bandId);
    const outsider = await registerAndLogin();

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(403);
  });

  it('should return 401 when no token is provided', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const setlistId = await createSetlist(owner.accessToken, bandId);

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .expect(401);
  });

  it('should return 404 when the setlist does not exist', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);

    await request(app.getHttpServer())
      .get(
        `/bands/${bandId}/setlists/00000000-0000-7000-8000-000000000000/songs`,
      )
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(404);
  });

  it('should return 404 when the setlist belongs to another band', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const otherBandId = await createBand(owner.accessToken);
    const otherSetlistId = await createSetlist(owner.accessToken, otherBandId);

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/setlists/${otherSetlistId}/songs`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(404);
  });
});
