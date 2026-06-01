import { HeadersDto } from '@shared/communication/dtos/headers.dto';
import '@shared/communication/dtos';

describe('HeadersDto', () => {
  it('should be instantiable with no properties', () => {
    const dto = new HeadersDto();
    expect(dto).toBeInstanceOf(HeadersDto);
  });

  it('should accept an authorization value', () => {
    const dto = new HeadersDto();
    dto['authorization'] = 'Bearer token';
    expect(dto['authorization']).toBe('Bearer token');
  });
});
