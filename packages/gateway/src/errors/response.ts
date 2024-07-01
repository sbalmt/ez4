import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncorrectResponseTypeError extends IncorrectTypeError {
  constructor(
    public responseType: string,
    fileName?: string
  ) {
    super('Incorrect route response', responseType, 'Http.Response', fileName);
  }
}

export class InvalidResponseTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid route response', undefined, 'Http.Response', fileName);
  }
}
