import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidHeadersTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid headers', undefined, baseType, fileName);
  }
}

export class IncorrectHeadersTypeError extends IncorrectTypeError {
  constructor(
    public headersType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect headers', headersType, baseType, fileName);
  }
}
