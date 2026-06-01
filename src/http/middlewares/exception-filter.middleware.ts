import {
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { ProblemsDetailInterface } from '@shared/exceptions/interfaces';
import { errors as helperErrors } from '@shared/helpers';

@Injectable()
export class ExceptionFilterMiddleware implements ExceptionFilter {
  catch(exception: ProblemsDetailInterface, host: ArgumentsHost) {
    const { type, code, status, title, detail, errors } = exception;
    let statusCode = code || status || HttpStatus.INTERNAL_SERVER_ERROR;
    const response = {
      error: helperErrors.internalServer.title,
      message: helperErrors.internalServer.detail,
      errors: [],
    };
    const ctx = host.switchToHttp();
    const ctxResponse = ctx.getResponse();
    const isClassValidatorError = title === ExceptionTypeEnum.ClassValidator;
    const isAppError =
      type === ExceptionTypeEnum.Application || isClassValidatorError;
    if (isAppError) {
      response.error = title;
      response.message =
        isClassValidatorError && errors[0]['detail']
          ? errors[0]['detail']
          : detail;
      response.errors = errors || [];
    }
    return ctxResponse.status(statusCode).send(response);
  }
}
