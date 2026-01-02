import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteEngineError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete database engine', properties, fileName);
  }
}

export class InvalidEngineTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid database engine type', undefined, 'Database.Engine', fileName);
  }
}

export class IncorrectEngineTypeError extends IncorrectTypeError {
  constructor(
    public engineType: string,
    fileName?: string
  ) {
    super('Incorrect database engine type', engineType, 'Database.Engine', fileName);
  }
}
