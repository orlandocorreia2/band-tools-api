import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { BaseException } from '@shared/exceptions/base.exception';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = () => `band.song.${uniqueSuffix()}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const uniqueBandName = () => `Band Song E2E ${uniqueSuffix()}`;

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

const validSongPayload = () => ({
  title: 'Come As You Are',
  tuning: 'Drop D',
  tonality: 'E Minor',
  bpm: 120,
  duration: 219,
  lyrics: 'Letra da música...',
  notes: 'Tocar mais devagar no refrão',
});

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('POST /bands/:id/song (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let bandId: string;

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

    const owner = await registerAndLogin();
    accessToken = owner.accessToken;

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
    bandId = band.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 201 when payload contains only the required title field', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Smells Like Teen Spirit' })
      .expect(201);
  });

  it('should return 201 when payload is fully filled', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validSongPayload())
      .expect(201);
  });

  it('should return 400 when the request body is malformed JSON', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400);
  });

  it('should return 422 when title is missing', async () => {
    const { title, ...rest } = validSongPayload();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when title is empty', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validSongPayload(), title: '' })
      .expect(422);
  });

  it('should return 422 when bpm is not a positive integer', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validSongPayload(), bpm: -1 })
      .expect(422);
  });

  it('should return 422 when duration is not a positive integer', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validSongPayload(), duration: -1 })
      .expect(422);
  });

  it('should return 422 when the band id in the route is not a valid UUID', async () => {
    await request(app.getHttpServer())
      .post('/bands/not-a-uuid/song')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validSongPayload())
      .expect(422);
  });

  it('should return 404 when the band does not exist', async () => {
    await request(app.getHttpServer())
      .post('/bands/00000000-0000-7000-8000-000000000000/song')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validSongPayload())
      .expect(404);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const member = await registerAndLogin();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send(validSongPayload())
      .expect(403);

    const dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: member.userId });

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send(validSongPayload())
      .expect(404);
  });

  it('should return 403 when the authenticated user is not a member of the band', async () => {
    const outsider = await registerAndLogin();

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .send(validSongPayload())
      .expect(403);
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/song`)
      .send(validSongPayload())
      .expect(401);
  });
});
