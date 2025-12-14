import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidRequestTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid request', undefined, baseType, fileName);
  }
}

export class IncorrectRequestTypeError extends IncorrectTypeError {
  constructor(
    public requestType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect request', requestType, baseType, fileName);
  }
}
