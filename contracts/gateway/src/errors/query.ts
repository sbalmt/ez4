import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidQueryTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid query strings', undefined, baseType, fileName);
  }
}

export class IncorrectQueryTypeError extends IncorrectTypeError {
  constructor(
    public queryType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect query strings', queryType, baseType, fileName);
  }
}
