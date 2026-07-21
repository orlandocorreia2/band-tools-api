import { ExceptionTypeEnum } from '@shared/commons/enums/exception.enum';
import { HttpStatus } from '@nestjs/common';
import { errors as helperErrors } from '@shared/helpers';
import { ExceptionFilterMiddleware } from '@http/middlewares/exception-filter.middleware';

describe('ExceptionFilterMiddleware', () => {
  let middleware: ExceptionFilterMiddleware;
  let mockSend: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: any;

  beforeEach(() => {
    middleware = new ExceptionFilterMiddleware();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ send: mockSend });
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ status: mockStatus }),
      }),
    };
  });

  describe('statusCode resolution', () => {
    it('should use code when defined', () => {
      middleware.catch({ code: 400 }, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should use status when code is undefined', () => {
      middleware.catch({ status: 422 }, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(422);
    });

    it('should fall back to INTERNAL_SERVER_ERROR when code and status are undefined', () => {
      middleware.catch({}, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('non-app error', () => {
    it('should return default error response', () => {
      middleware.catch({}, mockHost);

      expect(mockSend).toHaveBeenCalledWith({
        error: helperErrors.internalServer.title,
        message: helperErrors.internalServer.detail,
        errors: [],
      });
    });
  });

  describe('Application type error', () => {
    it('should set response from exception with errors array', () => {
      const exception = {
        type: ExceptionTypeEnum.Application,
        title: 'App Error',
        detail: 'Something went wrong',
        errors: [{ message: 'field invalid' }],
      };

      middleware.catch(exception, mockHost);

      expect(mockSend).toHaveBeenCalledWith({
        error: 'App Error',
        message: 'Something went wrong',
        errors: [{ message: 'field invalid' }],
      });
    });

    it('should use empty array when errors is undefined', () => {
      const exception = {
        type: ExceptionTypeEnum.Application,
        title: 'App Error',
        detail: 'Something went wrong',
      };

      middleware.catch(exception, mockHost);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ errors: [] }),
      );
    });
  });

  describe('ClassValidator error', () => {
    it('should use errors[0].detail as message when present', () => {
      const exception = {
        title: ExceptionTypeEnum.ClassValidator,
        detail: 'fallback',
        errors: [{ detail: 'field is required' }],
      };

      middleware.catch(exception, mockHost);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'field is required' }),
      );
    });

    it('should fall back to detail when errors[0].detail is absent', () => {
      const exception = {
        title: ExceptionTypeEnum.ClassValidator,
        detail: 'fallback detail',
        errors: [{}],
      };

      middleware.catch(exception, mockHost);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'fallback detail' }),
      );
    });
  });
});
