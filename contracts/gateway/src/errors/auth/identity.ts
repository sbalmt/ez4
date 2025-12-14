import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidIdentityTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid identity', undefined, baseType, fileName);
  }
}

export class IncorrectIdentityTypeError extends IncorrectTypeError {
  constructor(
    public identityType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect identity', identityType, baseType, fileName);
  }
}
