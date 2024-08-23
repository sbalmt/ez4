import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidHeadersTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid request headers', undefined, 'Http.Headers', fileName);
  }
}

export class IncorrectHeadersTypeError extends IncorrectTypeError {
  constructor(
    public headersType: string,
    fileName?: string
  ) {
    super('Incorrect request headers', headersType, 'Http.Headers', fileName);
  }
}
