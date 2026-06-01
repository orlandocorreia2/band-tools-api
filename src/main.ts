import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenapiCommons } from '@shared/commons/openapi.commons';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';

const ignoreEnvFile = process.env.NODE_ENV === 'PRODUCTION';

ConfigModule.forRoot({
  ignoreEnvFile,
  isGlobal: true,
  envFilePath: '.env',
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
    }),
    { bufferLogs: true },
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  app.use(
    '/openapi',
    apiReference({
      withFastify: true,
      theme: 'bluePlanet',
      spec: {
        content: new OpenapiCommons(app).buildDocumentation(),
      },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'authorization',
      'content-type',
      'accept',
      'cache-control',
    ],
    credentials: false,
  });

  app.useGlobalFilters(new ExceptionFilterMiddleware());

  await app.listen(port ?? 3000, '0.0.0.0');
}
bootstrap();
