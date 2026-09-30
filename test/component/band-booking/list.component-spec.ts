import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { createComponentApp } from '../support/create-component-app';
import { InMemoryStore } from '../support/in-memory-store';
import { AuthenticatedUser, registerAndLogin } from '../support/authenticate';

const validBandPayload = () => ({
  name: 'Banda Agenda',
  genre: 'Heavy Metal',
  state: 'São Paulo',
  city: 'São Paulo',
  neighborhood: 'Centro',
  address: 'Avenida Paulista, 1000',
  started_at: '2026-06-01',
  description: 'Descrição da Banda',
});

const validContactPayload = () => ({
  name: 'Maria Souza',
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

const validBookingPayload = (contactId: string) => ({
  title: 'Show Bar do Zé',
  contact_id: contactId,
  date: '2099-12-20',
  start_time: '22:00',
  duration: '1 hora',
  fee: 800.5,
});

type BookingItem = Record<string, unknown> & {
  contact: Record<string, unknown>;
};

describe('GET /bands/:id/bookings (component)', () => {
  let app: INestApplication;
  let store: InMemoryStore;
  let user: AuthenticatedUser;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  const createBand = async (): Promise<string> => {
    await request(app.getHttpServer())
      .post('/bands')
      .set(auth(user.accessToken))
      .send(validBandPayload())
      .expect(201);

    return store.bands.all()[0].id;
  };

  const createContact = async (): Promise<string> => {
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set(auth(user.accessToken))
      .send(validContactPayload())
      .expect(201);

    return store.contacts.all()[0].id;
  };

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

  it('should return 200 with the bookings and their nested contact', async () => {
    const bandId = await createBand();
    const contactId = await createContact();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set(auth(user.accessToken))
      .send(validBookingPayload(contactId))
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(user.accessToken))
      .expect(200);

    const { data } = response.body as { data: BookingItem[] };
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      title: 'Show Bar do Zé',
      date: '2099-12-20',
      start_time: '22:00',
      duration: '1 hora',
      fee: 800.5,
      status: 'Pending',
      consumption: null,
      link: null,
      note: null,
    });
    expect(data[0].contact).toMatchObject({
      id: contactId,
      name: 'Maria Souza',
      venue_name: 'Bar do Zé',
    });
    expect(data[0]).not.toHaveProperty('band_id');
    expect(data[0]).not.toHaveProperty('contact_id');
    expect(data[0].contact).not.toHaveProperty('user_id');
    expect(data[0].contact).not.toHaveProperty('created_at');
    expect(data[0].contact).not.toHaveProperty('updated_at');
  });

  it('should return 200 with an empty data array when the band has no bookings', async () => {
    const bandId = await createBand();

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(user.accessToken))
      .expect(200);

    expect(response.body).toEqual({ data: [] });
  });

  it('should return 401 when no token is provided', async () => {
    const bandId = await createBand();

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .expect(401);
  });

  it('should return 422 when the band id is not a valid UUID v7', async () => {
    await request(app.getHttpServer())
      .get('/bands/not-a-uuid/bookings')
      .set(auth(user.accessToken))
      .expect(422);
  });

  it('should return 404 when the band does not exist', async () => {
    await request(app.getHttpServer())
      .get(`/bands/${uuidv7()}/bookings`)
      .set(auth(user.accessToken))
      .expect(404);
  });

  it('should return 403 without bookings when the user is not a member of the band', async () => {
    const bandId = await createBand();
    const contactId = await createContact();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set(auth(user.accessToken))
      .send(validBookingPayload(contactId))
      .expect(201);
    const outsider = await registerAndLogin(app);

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(outsider.accessToken))
      .expect(403);

    expect(response.body).not.toHaveProperty('data');
  });
});
