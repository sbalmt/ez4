import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidBodyTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid body', undefined, baseType, fileName);
  }
}

export class IncorrectBodyTypeError extends IncorrectTypeError {
  constructor(
    public bodyType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect body', bodyType, baseType, fileName);
  }
}
