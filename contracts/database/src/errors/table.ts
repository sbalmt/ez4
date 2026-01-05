import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteTableError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete database table', properties, fileName);
  }
}

export class InvalidTableTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid database table type', undefined, 'Database.Table', fileName);
  }
}

export class IncorrectTableTypeError extends IncorrectTypeError {
  constructor(
    public tableType: string,
    fileName?: string
  ) {
    super('Incorrect database table type', tableType, 'Database.Table', fileName);
  }
}
