import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { title, description, version } from '@package.json';

export class OpenapiCommons {
  constructor(private readonly app: NestFastifyApplication) {}
  buildDocumentation() {
    const config = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .setTermsOfService('https://band-tools.com.br/terms')
      .addServer('http://localhost:3000')
      .addServer('https://band-tools.com.br/v1')
      .addGlobalParameters({
        name: 'authorization',
        description: 'JWT token',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          format: 'JWT',
        },
      })
      .setVersion(version || '1.0')
      .build();

    return SwaggerModule.createDocument(this.app, config);
  }
}
