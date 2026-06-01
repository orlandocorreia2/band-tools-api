import { HeadersDto } from '@shared/communication/dtos';

export interface AuthUser {
  id: string;
  name: string;
}

export interface TransactionApplicationContextInterface<T = any> {
  headers?: HeadersDto;
  authUser?: AuthUser;
  body?: T;
}

export interface MapperInterface {
  mapToTransactionContext<T = any>(
    context: TransactionApplicationContextInterface<T>,
  ): TransactionApplicationContextInterface<T>;
}

export interface FindIdInterface {
  id: string;
}

export type ErrorType =
  | {
      message: string;
    }
  | any;
