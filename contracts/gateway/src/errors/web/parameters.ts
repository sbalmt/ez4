import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidParameterTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid path parameters', undefined, baseType, fileName);
  }
}

export class IncorrectParameterTypeError extends IncorrectTypeError {
  constructor(
    public parametersType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect path parameters', parametersType, baseType, fileName);
  }
}
