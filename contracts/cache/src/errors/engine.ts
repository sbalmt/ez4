import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteEngineError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete cache engine', properties, fileName);
  }
}

export class InvalidEngineTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid cache engine type', undefined, 'Cache.Engine', fileName);
  }
}

export class IncorrectEngineTypeError extends IncorrectTypeError {
  constructor(
    public engineType: string,
    fileName?: string
  ) {
    super('Incorrect cache engine type', engineType, 'Cache.Engine', fileName);
  }
}
