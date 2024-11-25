import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidIdentityTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid identity', undefined, 'Http.Identity', fileName);
  }
}

export class IncorrectIdentityTypeError extends IncorrectTypeError {
  constructor(
    public identityType: string,
    fileName?: string
  ) {
    super('Incorrect identity', identityType, 'Http.Identity', fileName);
  }
}
