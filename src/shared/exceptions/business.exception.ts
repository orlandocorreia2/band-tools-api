import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ProblemsDetailInterface } from './interfaces';
import { errors } from '@shared/helpers';

export class ApplicationUnauthorizedException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.UNAUTHORIZED;
    this.title = error.title || errors.unauthorized.title;
    this.detail = error.detail || errors.unauthorized.detail;
  }
}

export class ApplicationBadRequestException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.BAD_REQUEST;
    this.title = error.title || errors.badRequest.title;
    this.detail = error.detail || errors.badRequest.detail;
  }
}

export class ApplicationNotFoundException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.NOT_FOUND;
    this.title = error.title || errors.notFound.title;
    this.detail = error.detail || errors.notFound.detail;
  }
}

export class ApplicationForbiddenException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.FORBIDDEN;
    this.title = error.title || errors.forbidden.title;
    this.detail = error.detail || errors.forbidden.detail;
  }
}

export class ApplicationUnprocessableEntityException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.UNPROCESSABLE_ENTITY;
    this.title = error.title || errors.unprocessableEntity.title;
    this.detail = error.detail || errors.unprocessableEntity.detail;
  }
}

export class ApplicationConflictException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.CONFLICT;
    this.title = error.title || errors.conflict.title;
    this.detail = error.detail || errors.conflict.detail;
  }
}

export class ApplicationFailedDependencyException extends BaseException {
  constructor(error: ProblemsDetailInterface) {
    super(error);
    this.code = HttpStatus.FAILED_DEPENDENCY;
    this.title = error.title || errors.failedDependency.title;
    this.detail = error.detail || errors.failedDependency.detail;
  }
}
