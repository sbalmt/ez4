import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncorrectRequestTypeError extends IncorrectTypeError {
  constructor(
    public requestType: string,
    fileName?: string
  ) {
    super('Incorrect route request', requestType, 'Http.Request', fileName);
  }
}

export class InvalidRequestTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid route request', undefined, 'Http.Request', fileName);
  }
}
