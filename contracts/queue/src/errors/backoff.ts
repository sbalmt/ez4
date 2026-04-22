import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteBackoffError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete backoff configuration', properties, fileName);
  }
}

export class InvalidBackoffTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid backoff type', undefined, 'Queue.Backoff', fileName);
  }
}

export class IncorrectBackoffTypeError extends IncorrectTypeError {
  constructor(modelType: string, fileName?: string) {
    super('Incorrect backoff type', modelType, 'Queue.Backoff', fileName);
  }
}
