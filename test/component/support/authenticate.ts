import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export type AuthenticatedUser = { accessToken: string; userId: string };

const decodeUserIdFromToken = (token: string): string => {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    sub: string;
  };
  return decoded.sub;
};

export const registerAndLogin = async (
  app: INestApplication,
): Promise<AuthenticatedUser> => {
  const credentials = {
    email: `component.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`,
    password: 'Password1',
  };

  await request(app.getHttpServer())
    .post('/users')
    .send({
      first_name: 'John',
      last_name: 'Lennon',
      phone: '11912345678',
      ...credentials,
    })
    .expect(201);

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(credentials)
    .expect(200);

  const { accessToken } = loginResponse.body as { accessToken: string };
  return { accessToken, userId: decodeUserIdFromToken(accessToken) };
};
