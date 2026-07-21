import { LoginResponseDto } from '@shared/communication/dtos/auth/login-response.dto';

describe('LoginResponseDto', () => {
  it('should expose the access token passed to the constructor', () => {
    const dto = new LoginResponseDto('signed-jwt');

    expect(dto.accessToken).toBe('signed-jwt');
  });
});
