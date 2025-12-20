import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidDefaultsTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid defaults', undefined, baseType, fileName);
  }
}

export class IncorrectDefaultsTypeError extends IncorrectTypeError {
  constructor(
    public defaultsType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect defaults', defaultsType, baseType, fileName);
  }
}
