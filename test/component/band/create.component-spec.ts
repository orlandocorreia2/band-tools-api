import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createComponentApp } from '../support/create-component-app';
import { InMemoryStore } from '../support/in-memory-store';
import { AuthenticatedUser, registerAndLogin } from '../support/authenticate';

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

describe('POST /bands (component)', () => {
  let app: INestApplication;
  let store: InMemoryStore;
  let user: AuthenticatedUser;

  beforeAll(async () => {
    ({ app, store } = await createComponentApp());
  });

  beforeEach(async () => {
    store.clearAll();
    user = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 201 and register the authenticated user as owner', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(validPayload())
      .expect(201);

    const [band] = store.bands.all();
    expect(band.name).toBe('Nome da Banda');
    expect(store.bandMembers.all()).toEqual([
      expect.objectContaining({
        band_id: band.id,
        user_id: user.userId,
        is_owner: true,
      }),
    ]);
  });

  it('should start every test with empty in-memory repositories', () => {
    expect(store.bands.all()).toHaveLength(0);
    expect(store.users.all()).toHaveLength(1);
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .send(validPayload())
      .expect(401);

    expect(store.bands.all()).toHaveLength(0);
  });

  it('should return 400 when name is missing', async () => {
    await request(app.getHttpServer())
      .post('/bands')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ ...validPayload(), name: undefined })
      .expect(400);

    expect(store.bands.all()).toHaveLength(0);
  });
});
