import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { BaseException } from '@shared/exceptions/base.exception';

describe('BaseException', () => {
  it('should extend Error and set all properties from the error object', () => {
    const error = {
      title: 'Test Error',
      detail: 'Something failed',
      code: 500,
      errors: [{ field: 'name', message: 'required' }],
    };

    const exception = new BaseException(error as any);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe('Test Error');
    expect(exception.name).toBe('Test Error');
    expect(exception.code).toBe(500);
    expect(exception.title).toBe('Test Error');
    expect(exception.detail).toBe('Something failed');
    expect(exception.errors).toEqual(error.errors);
  });

  it('should default type to ExceptionTypeEnum.Application', () => {
    const exception = new BaseException({});

    expect(exception.type).toBe(ExceptionTypeEnum.Application);
  });
});
