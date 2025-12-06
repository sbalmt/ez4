import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidResponseTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid route response', undefined, baseType, fileName);
  }
}

export class IncorrectResponseTypeError extends IncorrectTypeError {
  constructor(
    public responseType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect route response', responseType, baseType, fileName);
  }
}
