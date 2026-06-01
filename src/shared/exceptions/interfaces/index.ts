import { ExceptionTypeEnum } from '@shared/commons/enums';

export interface ProblemsDetailInterface {
  code?: number;
  status?: number;
  type?: ExceptionTypeEnum;
  title?: string;
  detail?: string;
  message?: string;
  name?: string;
  errors?: string[] | Record<string, string>[];
  stack?: string;
  cause?: {
    failure?: {
      cause?: { applicationFailureInfo?: { type?: string }; message?: string };
    };
  };
}
