import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

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

describe('POST /bands (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 201 when payload is valid', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .send(validPayload())
      .expect(201);
  });

  it('should return 400 when name is missing', async () => {
    const { name, ...rest } = validPayload();
    await request(app.getHttpServer()).post('/bands').send(rest).expect(400);
  });

  it('should return 400 when name is shorter than 3 characters', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .send({ ...validPayload(), name: 'AB' })
      .expect(400);
  });

  it('should return 400 when genre is missing', async () => {
    const { genre, ...rest } = validPayload();
    await request(app.getHttpServer()).post('/bands').send(rest).expect(400);
  });

  it('should return 400 when started_at is missing', async () => {
    const { started_at, ...rest } = validPayload();
    await request(app.getHttpServer()).post('/bands').send(rest).expect(400);
  });
});
