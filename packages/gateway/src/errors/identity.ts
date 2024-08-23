import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidIdentityTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid request identity', undefined, 'Http.Identity', fileName);
  }
}

export class IncorrectIdentityTypeError extends IncorrectTypeError {
  constructor(
    public identityType: string,
    fileName?: string
  ) {
    super('Incorrect request identity', identityType, 'Http.Identity', fileName);
  }
}
