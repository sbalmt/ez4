import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncorrectBodyTypeError extends IncorrectTypeError {
  constructor(
    public bodyType: string,
    fileName?: string
  ) {
    super('Incorrect request body', bodyType, 'Http.JsonBody', fileName);
  }
}

export class InvalidBodyTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid request body', undefined, 'Http.JsonBody', fileName);
  }
}
