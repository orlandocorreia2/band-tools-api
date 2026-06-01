import { HttpStatus } from '@nestjs/common';
import { errors } from '@shared/helpers';
import {
  ApplicationUnauthorizedException,
  ApplicationBadRequestException,
  ApplicationNotFoundException,
  ApplicationForbiddenException,
  ApplicationUnprocessableEntityException,
  ApplicationConflictException,
  ApplicationFailedDependencyException,
} from '@shared/exceptions/business.exception';
import { BaseException } from '@shared/exceptions/base.exception';

const testCases = [
  {
    name: 'ApplicationUnauthorizedException',
    Class: ApplicationUnauthorizedException,
    code: HttpStatus.UNAUTHORIZED,
    defaults: errors.unauthorized,
  },
  {
    name: 'ApplicationBadRequestException',
    Class: ApplicationBadRequestException,
    code: HttpStatus.BAD_REQUEST,
    defaults: errors.badRequest,
  },
  {
    name: 'ApplicationNotFoundException',
    Class: ApplicationNotFoundException,
    code: HttpStatus.NOT_FOUND,
    defaults: errors.notFound,
  },
  {
    name: 'ApplicationForbiddenException',
    Class: ApplicationForbiddenException,
    code: HttpStatus.FORBIDDEN,
    defaults: errors.forbidden,
  },
  {
    name: 'ApplicationUnprocessableEntityException',
    Class: ApplicationUnprocessableEntityException,
    code: HttpStatus.UNPROCESSABLE_ENTITY,
    defaults: errors.unprocessableEntity,
  },
  {
    name: 'ApplicationConflictException',
    Class: ApplicationConflictException,
    code: HttpStatus.CONFLICT,
    defaults: errors.conflict,
  },
  {
    name: 'ApplicationFailedDependencyException',
    Class: ApplicationFailedDependencyException,
    code: HttpStatus.FAILED_DEPENDENCY,
    defaults: errors.failedDependency,
  },
];

describe.each(testCases)('$name', ({ Class, code, defaults }) => {
  it('should extend BaseException with the correct HTTP status code', () => {
    const exception = new Class({});

    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.code).toBe(code);
  });

  it('should use provided title and detail', () => {
    const exception = new Class({
      title: 'Custom Title',
      detail: 'Custom Detail',
    });

    expect(exception.title).toBe('Custom Title');
    expect(exception.detail).toBe('Custom Detail');
  });

  it('should fall back to default title and detail when not provided', () => {
    const exception = new Class({});

    expect(exception.title).toBe(defaults.title);
    expect(exception.detail).toBe(defaults.detail);
  });
});
