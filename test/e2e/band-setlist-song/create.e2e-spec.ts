import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
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
import { BandSetlistSongTypeormEntity } from '@infrastructure/entities/band/band-setlist-song-typeorm.entity';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { BaseException } from '@shared/exceptions/base.exception';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = () => `band.setlist.song.${uniqueSuffix()}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const uniqueBandName = () => `Band Setlist Song E2E ${uniqueSuffix()}`;

const validBandPayload = (name: string) => ({
  name,
  genre: 'Heavy Metal',
  state: 'São Paulo',
  city: 'São Paulo',
  neighborhood: 'Centro',
  address: 'Avenida Paulista, 1000',
  started_at: '2026-06-01',
  description: 'Descrição da Banda',
});

const uniqueSetlistName = () => `Show de Sábado ${uniqueSuffix()}`;

const validSetlistPayload = (name: string) => ({ name });

const uniqueSongTitle = () => `Come As You Are ${uniqueSuffix()}`;

const validSongPayload = (title: string) => ({ title });

const validAddSongPayload = (bandSongId: string, position = 1) => ({
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

describe('POST /bands/:id/setlists/:setlistId/songs (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let bandId: string;
  let setlistId: string;
  let bandSongId: string;

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

  const createBand = async (token: string): Promise<string> => {
    const bandName = uniqueBandName();
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${token}`)
      .send(validBandPayload(bandName))
      .expect(201);

    const band = await dataSource
      .getRepository(BandTypeormEntity)
      .findOneBy({ name: bandName });
    return band.id;
  };

  const createSetlist = async (
    token: string,
    forBandId: string,
  ): Promise<string> => {
    const name = uniqueSetlistName();
    await request(app.getHttpServer())
      .post(`/bands/${forBandId}/setlists`)
      .set('Authorization', `Bearer ${token}`)
      .send(validSetlistPayload(name))
      .expect(201);

    const setlist = await dataSource
      .getRepository(BandSetlistTypeormEntity)
      .findOneBy({ name });
    return setlist.id;
  };

  const createSong = async (
    token: string,
    forBandId: string,
  ): Promise<string> => {
    const title = uniqueSongTitle();
    await request(app.getHttpServer())
      .post(`/bands/${forBandId}/songs`)
      .set('Authorization', `Bearer ${token}`)
      .send(validSongPayload(title))
      .expect(201);

    const song = await dataSource
      .getRepository(BandSongTypeormEntity)
      .findOneBy({ title });
    return song.id;
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

    dataSource = app.get<DataSource>(getDataSourceToken());

    const owner = await registerAndLogin();
    accessToken = owner.accessToken;

    bandId = await createBand(accessToken);
    setlistId = await createSetlist(accessToken, bandId);
    bandSongId = await createSong(accessToken, bandId);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 201 when payload contains bandSongId and position', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId, 1))
      .expect(201);
  });

  it('should return 400 when the request body is malformed JSON', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send('{"bandSongId":')
      .expect(400);
  });

  it('should return 422 when bandSongId is missing', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ position: 1 })
      .expect(422);
  });

  it('should return 422 when bandSongId is not a valid UUID', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bandSongId: 'not-a-uuid', position: 1 })
      .expect(422);
  });

  it('should return 422 when position is missing', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bandSongId })
      .expect(422);
  });

  it('should return 422 when position is not a positive integer', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId, -1))
      .expect(422);
  });

  it('should return 422 when the band id in the route is not a valid UUID', async () => {
    await request(app.getHttpServer())
      .post(`/bands/not-a-uuid/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(422);
  });

  it('should return 404 when the band does not exist', async () => {
    await request(app.getHttpServer())
      .post(
        `/bands/00000000-0000-7000-8000-000000000000/setlists/${setlistId}/songs`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(404);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const member = await registerAndLogin();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(403);

    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: member.userId });

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(404);
  });

  it('should return 403 when the authenticated user is not a member of the band', async () => {
    const outsider = await registerAndLogin();

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(403);
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .send(validAddSongPayload(bandSongId))
      .expect(401);
  });

  it('should return 404 when the setlist does not exist', async () => {
    await request(app.getHttpServer())
      .post(
        `/bands/${bandId}/setlists/00000000-0000-7000-8000-000000000000/songs`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(404);
  });

  it('should return 404 when the setlist belongs to another band', async () => {
    const otherBandId = await createBand(accessToken);
    const otherSetlistId = await createSetlist(accessToken, otherBandId);

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${otherSetlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId))
      .expect(404);
  });

  it('should return 404 when the song does not exist', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload('00000000-0000-7000-8000-000000000000'))
      .expect(404);
  });

  it('should return 404 when the song belongs to another band', async () => {
    const otherBandId = await createBand(accessToken);
    const otherSongId = await createSong(accessToken, otherBandId);

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlistId}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(otherSongId))
      .expect(404);
  });

  it('should return 201 when the same song is added twice to the same setlist', async () => {
    const setlist = await createSetlist(accessToken, bandId);

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlist}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId, 1))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlist}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId, 2))
      .expect(201);
  });

  it('should reposition to MAX(position) + 1 when the requested position collides with an existing song', async () => {
    const setlist = await createSetlist(accessToken, bandId);
    const secondSongId = await createSong(accessToken, bandId);

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlist}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(bandSongId, 1))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/setlists/${setlist}/songs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validAddSongPayload(secondSongId, 1))
      .expect(201);

    const persisted = await dataSource
      .getRepository(BandSetlistSongTypeormEntity)
      .findOneBy({ band_setlist_id: setlist, band_song_id: secondSongId });

    expect(persisted.position).toBe(2);
  });
});
