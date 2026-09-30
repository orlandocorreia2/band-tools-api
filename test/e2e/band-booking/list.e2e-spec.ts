import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { truncateAllTables } from '../support/database-cleaner';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band/band-member-typeorm.entity';
import { BandBookingTypeormEntity } from '@infrastructure/entities/band/band-booking-typeorm.entity';
import { ContactTypeormEntity } from '@infrastructure/entities/contact/contact-typeorm.entity';
import { BandBookingStatusEnum } from '@shared/commons/enums';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { BaseException } from '@shared/exceptions/base.exception';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: `band.booking.list.${uniqueSuffix()}@example.com`,
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
  description: 'Descrição da Banda',
});

const validContactPayload = (name: string) => ({
  name,
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

const bookingPayload = (
  contactId: string,
  overrides: Record<string, unknown> = {},
) => ({
  title: `Show ${uniqueSuffix()}`,
  contact_id: contactId,
  date: '2099-12-20',
  start_time: '22:00',
  duration: '1 hora',
  fee: 800,
  ...overrides,
});

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

type BookingItem = Record<string, unknown> & {
  title: string;
  contact: Record<string, unknown>;
};

describe('GET /bands/:id/bookings (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

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
    const name = `Band Booking List E2E ${uniqueSuffix()}`;
    await request(app.getHttpServer())
      .post('/bands')
      .set(auth(token))
      .send(validBandPayload(name))
      .expect(201);

    const band = await dataSource
      .getRepository(BandTypeormEntity)
      .findOneBy({ name });
    return band.id;
  };

  const createContact = async (token: string): Promise<string> => {
    const name = `Maria Souza ${uniqueSuffix()}`;
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set(auth(token))
      .send(validContactPayload(name))
      .expect(201);

    const contact = await dataSource
      .getRepository(ContactTypeormEntity)
      .findOneBy({ name });
    return contact.id;
  };

  const createBooking = async (
    token: string,
    bandId: string,
    payload: ReturnType<typeof bookingPayload>,
  ): Promise<void> => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set(auth(token))
      .send(payload)
      .expect(201);
  };

  const listBookings = async (
    token: string,
    bandId: string,
  ): Promise<BookingItem[]> => {
    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(token))
      .expect(200);

    return response.body.data as BookingItem[];
  };

  const addMember = async (bandId: string, userId: string): Promise<void> => {
    const repository = dataSource.getRepository(BandMemberTypeormEntity);
    await repository.save(
      repository.create({ band_id: bandId, user_id: userId, is_owner: false }),
    );
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
  });

  afterAll(async () => {
    await truncateAllTables(app.get(getDataSourceToken()));
    await app.close();
  });

  it('should return 200 with every booking field and the nested contact', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const contactId = await createContact(owner.accessToken);
    const payload = bookingPayload(contactId, {
      fee: 800.5,
      consumption: 'Consumação mínima de R$ 50,00 por pessoa',
      link: 'https://instagram.com/bardoze',
      note: 'Levar equipamento de som próprio',
    });
    await createBooking(owner.accessToken, bandId, payload);

    const [booking] = await listBookings(owner.accessToken, bandId);

    expect(booking).toMatchObject({
      id: expect.any(String),
      title: payload.title,
      date: '2099-12-20',
      start_time: '22:00',
      duration: '1 hora',
      fee: 800.5,
      status: BandBookingStatusEnum.Pending,
      consumption: 'Consumação mínima de R$ 50,00 por pessoa',
      link: 'https://instagram.com/bardoze',
      note: 'Levar equipamento de som próprio',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(booking.contact).toMatchObject({
      id: contactId,
      phone: '11987654321',
      venue_name: 'Bar do Zé',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      email: 'contato@bardoze.com',
      role: 'Produtor',
      alternate_phone: null,
      notes: null,
    });
    expect(booking).not.toHaveProperty('band_id');
    expect(booking).not.toHaveProperty('contact_id');
    expect(booking.contact).not.toHaveProperty('user_id');
    expect(booking.contact).not.toHaveProperty('created_at');
    expect(booking.contact).not.toHaveProperty('updated_at');
  });

  it('should return 200 with an empty data array when the band has no bookings', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(owner.accessToken))
      .expect(200);

    expect(response.body).toEqual({ data: [] });
  });

  it('should return optional fields as null when they were not provided', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const contactId = await createContact(owner.accessToken);
    await createBooking(owner.accessToken, bandId, bookingPayload(contactId));

    const [booking] = await listBookings(owner.accessToken, bandId);

    expect(booking).toHaveProperty('consumption', null);
    expect(booking).toHaveProperty('link', null);
    expect(booking).toHaveProperty('note', null);
  });

  it('should order bookings by date and then by start_time', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const contactId = await createContact(owner.accessToken);
    const late = bookingPayload(contactId, {
      date: '2099-12-20',
      start_time: '22:00',
    });
    const earliest = bookingPayload(contactId, {
      date: '2099-01-05',
      start_time: '23:00',
    });
    const early = bookingPayload(contactId, {
      date: '2099-12-20',
      start_time: '09:30',
    });
    for (const payload of [late, earliest, early]) {
      await createBooking(owner.accessToken, bandId, payload);
    }

    const bookings = await listBookings(owner.accessToken, bandId);

    expect(bookings.map((booking) => booking.title)).toEqual([
      earliest.title,
      early.title,
      late.title,
    ]);
  });

  it('should return only the bookings of the requested band', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const otherBandId = await createBand(owner.accessToken);
    const contactId = await createContact(owner.accessToken);
    const own = bookingPayload(contactId);
    await createBooking(owner.accessToken, bandId, own);
    await createBooking(
      owner.accessToken,
      otherBandId,
      bookingPayload(contactId),
    );

    const bookings = await listBookings(owner.accessToken, bandId);

    expect(bookings.map((booking) => booking.title)).toEqual([own.title]);
  });

  it('should return the contact of a booking created by another member without its user_id', async () => {
    const owner = await registerAndLogin();
    const member = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    await addMember(bandId, member.userId);
    const memberContactId = await createContact(member.accessToken);
    await createBooking(
      member.accessToken,
      bandId,
      bookingPayload(memberContactId),
    );

    const [booking] = await listBookings(owner.accessToken, bandId);

    expect(booking.contact).toMatchObject({ id: memberContactId });
    expect(booking.contact).not.toHaveProperty('user_id');
  });

  it('should return the persisted status instead of normalizing it to Pending', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const contactId = await createContact(owner.accessToken);
    const payload = bookingPayload(contactId);
    await createBooking(owner.accessToken, bandId, payload);
    await dataSource
      .getRepository(BandBookingTypeormEntity)
      .update(
        { title: payload.title },
        { status: BandBookingStatusEnum.Confirmed },
      );

    const [booking] = await listBookings(owner.accessToken, bandId);

    expect(booking.status).toBe(BandBookingStatusEnum.Confirmed);
  });

  it('should return 401 when no token is provided', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .expect(401);
  });

  it('should return 422 when the band id in the route is not a valid UUID', async () => {
    const owner = await registerAndLogin();

    await request(app.getHttpServer())
      .get('/bands/not-a-uuid/bookings')
      .set(auth(owner.accessToken))
      .expect(422);
  });

  it('should return 404 when the band does not exist', async () => {
    const owner = await registerAndLogin();

    await request(app.getHttpServer())
      .get('/bands/00000000-0000-7000-8000-000000000000/bookings')
      .set(auth(owner.accessToken))
      .expect(404);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const owner = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const ghost = await registerAndLogin();
    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: ghost.userId });

    await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(ghost.accessToken))
      .expect(404);
  });

  it('should return 403 without any booking data when the user is not a member of the band', async () => {
    const owner = await registerAndLogin();
    const outsider = await registerAndLogin();
    const bandId = await createBand(owner.accessToken);
    const contactId = await createContact(owner.accessToken);
    await createBooking(owner.accessToken, bandId, bookingPayload(contactId));

    const response = await request(app.getHttpServer())
      .get(`/bands/${bandId}/bookings`)
      .set(auth(outsider.accessToken))
      .expect(403);

    expect(response.body).not.toHaveProperty('data');
  });
});
