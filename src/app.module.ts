import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@http/http.module';
import { ConfigModule } from '@nestjs/config';
import { TrimStringsMiddleware } from '@http/middlewares/trim-strings.middleware';
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, HttpModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TrimStringsMiddleware).forRoutes('*');
  }
}
