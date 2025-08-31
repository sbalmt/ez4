import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidQueryTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid request query strings', undefined, 'Http.QueryStrings', fileName);
  }
}

export class IncorrectQueryTypeError extends IncorrectTypeError {
  constructor(
    public queryType: string,
    fileName?: string
  ) {
    super('Incorrect request query strings', queryType, 'Http.QueryStrings', fileName);
  }
}
