import { ConfigModule } from '@nestjs/config';
import { TrimStringsMiddleware } from '@http/middlewares/trim-strings.middleware';
import { AppModule } from '../../src/app.module';

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({ module: class ConfigModule {} }),
  },
}));

jest.mock('@http/http.module', () => ({
  HttpModule: class HttpModule {},
}));

jest.mock('@http/middlewares/trim-strings.middleware', () => ({
  TrimStringsMiddleware: class TrimStringsMiddleware {},
}));

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be instantiable', () => {
    expect(new AppModule()).toBeInstanceOf(AppModule);
  });

  it('should call ConfigModule.forRoot with isGlobal true', () => {
    expect(ConfigModule.forRoot).toHaveBeenCalledWith({ isGlobal: true });
  });

  it('should apply TrimStringsMiddleware for all routes', () => {
    const mockForRoutes = jest.fn();
    const mockApply = jest.fn().mockReturnValue({ forRoutes: mockForRoutes });
    const mockConsumer = { apply: mockApply };

    new AppModule().configure(mockConsumer as any);

    expect(mockApply).toHaveBeenCalledWith(TrimStringsMiddleware);
    expect(mockForRoutes).toHaveBeenCalledWith('*');
  });
});
