import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteDeadLetterError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete dead-letter', properties, fileName);
  }
}

export class InvalidDeadLetterTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid dead-letter type', undefined, 'Queue.DeadLetter', fileName);
  }
}

export class IncorrectDeadLetterTypeError extends IncorrectTypeError {
  constructor(modelType: string, fileName?: string) {
    super('Incorrect dead-letter type', modelType, 'Queue.DeadLetter', fileName);
  }
}
