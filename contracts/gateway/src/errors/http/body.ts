import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidBodyTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid body', undefined, 'Http.JsonBody', fileName);
  }
}

export class IncorrectBodyTypeError extends IncorrectTypeError {
  constructor(
    public bodyType: string,
    fileName?: string
  ) {
    super('Incorrect body', bodyType, 'Http.JsonBody', fileName);
  }
}
