import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '@http/middlewares/jwt-auth.guard';
import { ApplicationUnauthorizedException } from '@shared/exceptions/business.exception';

type JwtServiceMock = { verifyAsync: jest.Mock };

type MockRequest = {
  headers: Record<string, string>;
  user?: { id: string; email: string };
};

const makeContext = (request: MockRequest): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtServiceMock;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: 'user-id', email: 'john@example.com' }),
    };
    guard = new JwtAuthGuard(jwtService as any);
  });

  it('should allow access and attach user to request when token is valid', async () => {
    const request: MockRequest = {
      headers: { authorization: 'Bearer valid-token' },
    };

    const result = await guard.canActivate(makeContext(request));

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual({ id: 'user-id', email: 'john@example.com' });
  });

  it('should throw ApplicationUnauthorizedException when Authorization header is missing', async () => {
    const request: MockRequest = { headers: {} };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(ApplicationUnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw ApplicationUnauthorizedException when header does not use the Bearer scheme', async () => {
    const request: MockRequest = {
      headers: { authorization: 'Basic some-token' },
    };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(ApplicationUnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw ApplicationUnauthorizedException when token is malformed or expired', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const request: MockRequest = {
      headers: { authorization: 'Bearer bad-token' },
    };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(ApplicationUnauthorizedException);
  });
});
