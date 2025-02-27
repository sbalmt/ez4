import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidDefaultsTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid defaults', undefined, 'Http.Defaults', fileName);
  }
}

export class IncorrectDefaultsTypeError extends IncorrectTypeError {
  constructor(
    public defaultsType: string,
    fileName?: string
  ) {
    super('Incorrect defaults', defaultsType, 'Http.Defaults', fileName);
  }
}
