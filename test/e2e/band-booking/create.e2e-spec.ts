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
import { BandBookingTypeormEntity } from '@infrastructure/entities/band/band-booking-typeorm.entity';
import { ContactTypeormEntity } from '@infrastructure/entities/contact/contact-typeorm.entity';
import { BandBookingStatusEnum } from '@shared/commons/enums';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { BaseException } from '@shared/exceptions/base.exception';

const uniqueSuffix = () =>
  `${Date.now()}.${Math.random().toString(36).slice(2)}`;

const uniqueEmail = () => `band.booking.${uniqueSuffix()}@example.com`;

const validUserPayload = () => ({
  first_name: 'John',
  last_name: 'Lennon',
  email: uniqueEmail(),
  phone: '11912345678',
  password: 'Password1',
});

const uniqueBandName = () => `Band Booking E2E ${uniqueSuffix()}`;

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

const uniqueContactName = () => `Maria Souza ${uniqueSuffix()}`;

const validContactPayload = (name: string) => ({
  name,
  phone: '11987654321',
  venue_name: 'Bar do Zé',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  email: 'contato@bardoze.com',
  role: 'Produtor',
});

const uniqueTitle = () => `Show Bar do Zé ${uniqueSuffix()}`;

const BRAZIL_UTC_OFFSET_HOURS = 3;

const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000);

// CreateBandBookingUseCase interprets date + start_time as Brazil wall-clock
// time (UTC-3, no DST). Derive both purely from UTC getters on a shifted
// instant so this helper is correct regardless of the test runner's local TZ.
const toBrazilDateAndTime = (instant: Date) => {
  const brazilWallClock = new Date(
    instant.getTime() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  );
  const date = `${brazilWallClock.getUTCFullYear()}-${String(
    brazilWallClock.getUTCMonth() + 1,
  ).padStart(2, '0')}-${String(brazilWallClock.getUTCDate()).padStart(2, '0')}`;
  const start_time = `${String(brazilWallClock.getUTCHours()).padStart(
    2,
    '0',
  )}:${String(brazilWallClock.getUTCMinutes()).padStart(2, '0')}`;

  return { date, start_time };
};

const validBookingPayload = (title: string, contactId: string) => {
  const { date, start_time } = toBrazilDateAndTime(hoursFromNow(2));

  return {
    title,
    contact_id: contactId,
    date,
    start_time,
    duration: '1 hora',
    fee: 800,
  };
};

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

describe('POST /bands/:id/bookings (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let bandId: string;
  let contactId: string;

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

  const createContact = async (token: string): Promise<string> => {
    const name = uniqueContactName();
    await request(app.getHttpServer())
      .post('/users/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send(validContactPayload(name))
      .expect(201);

    const dataSource = app.get<DataSource>(getDataSourceToken());
    const contact = await dataSource
      .getRepository(ContactTypeormEntity)
      .findOneBy({ name });
    return contact.id;
  };

  const findBookingByTitle = async (title: string) => {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    return dataSource
      .getRepository(BandBookingTypeormEntity)
      .findOneBy({ title });
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

    contactId = await createContact(accessToken);
  });

  afterAll(async () => {
    await truncateAllTables(app.get(getDataSourceToken()));
    await app.close();
  });

  it('should return 201 and persist the booking with status Pending when the required fields are valid', async () => {
    const title = uniqueTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBookingPayload(title, contactId))
      .expect(201);

    const booking = await findBookingByTitle(title);
    expect(booking).not.toBeNull();
    expect(booking.status).toBe(BandBookingStatusEnum.Pending);
    expect(booking.contact_id).toBe(contactId);
  });

  it('should persist optional fields when provided', async () => {
    const title = uniqueTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        consumption: 'Consumação mínima de R$ 50,00 por pessoa',
        link: 'https://instagram.com/bardoze',
        note: 'Levar equipamento de som próprio',
      })
      .expect(201);

    const booking = await findBookingByTitle(title);
    expect(booking.consumption).toBe(
      'Consumação mínima de R$ 50,00 por pessoa',
    );
    expect(booking.link).toBe('https://instagram.com/bardoze');
    expect(booking.note).toBe('Levar equipamento de som próprio');
  });

  it('should persist optional fields as null when not provided', async () => {
    const title = uniqueTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBookingPayload(title, contactId))
      .expect(201);

    const booking = await findBookingByTitle(title);
    expect(booking.consumption).toBeNull();
    expect(booking.link).toBeNull();
    expect(booking.note).toBeNull();
  });

  it('should return 201 and persist a free show when fee is zero', async () => {
    const title = uniqueTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validBookingPayload(title, contactId), fee: 0 })
      .expect(201);

    const booking = await findBookingByTitle(title);
    expect(Number(booking.fee)).toBe(0);
  });

  it('should return 400 when the request body is malformed JSON', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400);
  });

  it('should return 422 when title is missing', async () => {
    const { title, ...rest } = validBookingPayload(uniqueTitle(), contactId);
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when contact_id is missing', async () => {
    const { contact_id, ...rest } = validBookingPayload(
      uniqueTitle(),
      contactId,
    );
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(rest)
      .expect(422);
  });

  it('should return 422 when contact_id is not a valid UUID', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(uniqueTitle(), contactId),
        contact_id: 'not-a-uuid',
      })
      .expect(422);
  });

  it('should return 404 and not persist when contact_id does not correspond to any contact', async () => {
    const title = uniqueTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        contact_id: '00000000-0000-7000-8000-000000000000',
      })
      .expect(404);

    const booking = await findBookingByTitle(title);
    expect(booking).toBeNull();
  });

  it('should return 404 and not persist when contact_id belongs to another user', async () => {
    const otherUser = await registerAndLogin();
    const otherUserContactId = await createContact(otherUser.accessToken);
    const title = uniqueTitle();

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        contact_id: otherUserContactId,
      })
      .expect(404);

    const booking = await findBookingByTitle(title);
    expect(booking).toBeNull();
  });

  it('should return 422 when fee is negative', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...validBookingPayload(uniqueTitle(), contactId), fee: -1 })
      .expect(422);
  });

  it('should return 422 when fee exceeds the numeric(10,2) column capacity', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(uniqueTitle(), contactId),
        fee: 10000000000,
      })
      .expect(422);
  });

  it('should return 422 when fee has more than 2 decimal places', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(uniqueTitle(), contactId),
        fee: 800.999,
      })
      .expect(422);
  });

  it('should return 422 when link is not a valid URL', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(uniqueTitle(), contactId),
        link: 'not-a-url',
      })
      .expect(422);
  });

  it('should ignore a status field sent by the client and persist status Pending', async () => {
    const title = uniqueTitle();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        status: 'Confirmed',
      })
      .expect(201);

    const booking = await findBookingByTitle(title);
    expect(booking.status).toBe(BandBookingStatusEnum.Pending);
  });

  it('should return 422 and not persist when date is before the current date', async () => {
    const title = uniqueTitle();
    const { date } = toBrazilDateAndTime(hoursFromNow(-3 * 24));
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        date,
        start_time: '12:00',
      })
      .expect(422);

    const booking = await findBookingByTitle(title);
    expect(booking).toBeNull();
  });

  it('should return 422 and not persist when date is today and start_time already passed', async () => {
    const title = uniqueTitle();
    const { date, start_time } = toBrazilDateAndTime(hoursFromNow(-1));
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        date,
        start_time,
      })
      .expect(422);

    const booking = await findBookingByTitle(title);
    expect(booking).toBeNull();
  });

  it('should return 201 when date is today and start_time is still future', async () => {
    const title = uniqueTitle();
    const { date, start_time } = toBrazilDateAndTime(hoursFromNow(1));
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...validBookingPayload(title, contactId),
        date,
        start_time,
      })
      .expect(201);

    const booking = await findBookingByTitle(title);
    expect(booking).not.toBeNull();
  });

  it('should return 422 when the band id in the route is not a valid UUID', async () => {
    await request(app.getHttpServer())
      .post('/bands/not-a-uuid/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBookingPayload(uniqueTitle(), contactId))
      .expect(422);
  });

  it('should return 404 when the band does not exist', async () => {
    await request(app.getHttpServer())
      .post('/bands/00000000-0000-7000-8000-000000000000/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validBookingPayload(uniqueTitle(), contactId))
      .expect(404);
  });

  it('should return 404 when the authenticated user was deleted after the token was issued', async () => {
    const member = await registerAndLogin();
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send(validBookingPayload(uniqueTitle(), contactId))
      .expect(403);

    const dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource
      .getRepository(UserTypeormEntity)
      .delete({ id: member.userId });

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send(validBookingPayload(uniqueTitle(), contactId))
      .expect(404);
  });

  it('should return 403 when the authenticated user is not a member of the band', async () => {
    const outsider = await registerAndLogin();

    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .send(validBookingPayload(uniqueTitle(), contactId))
      .expect(403);
  });

  it('should return 401 when no token is provided', async () => {
    await request(app.getHttpServer())
      .post(`/bands/${bandId}/bookings`)
      .send(validBookingPayload(uniqueTitle(), contactId))
      .expect(401);
  });
});
