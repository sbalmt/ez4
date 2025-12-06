import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteAccessError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete gateway access', properties, fileName);
  }
}

export class InvalidAccessTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid gateway access type', undefined, 'Http.Access', fileName);
  }
}

export class IncorrectAccessTypeError extends IncorrectTypeError {
  constructor(
    public cacheType: string,
    fileName?: string
  ) {
    super('Incorrect gateway access type', cacheType, 'Http.Access', fileName);
  }
}
