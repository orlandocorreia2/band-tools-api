import { HttpStatus } from '@nestjs/common';
import { ProblemsDetailInterface } from './interfaces';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';

export class BaseException extends Error {
  code: HttpStatus;
  public type: ExceptionTypeEnum = ExceptionTypeEnum.Application;
  title: string;
  detail: string;
  errors: string[] | Record<string, string>[];

  constructor(error: ProblemsDetailInterface) {
    super(error.title);
    this.name = error.title;
    this.code = error.code;
    this.title = error.title;
    this.detail = error.detail;
    this.errors = error.errors;
  }
}
