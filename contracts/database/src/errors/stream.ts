import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteStreamError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete table stream', properties, fileName);
  }
}

export class InvalidStreamTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid table stream type', undefined, 'Database.Stream', fileName);
  }
}

export class IncorrectStreamTypeError extends IncorrectTypeError {
  constructor(
    public streamType: string,
    fileName?: string
  ) {
    super('Incorrect table stream type', streamType, 'Database.Stream', fileName);
  }
}
