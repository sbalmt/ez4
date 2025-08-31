import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteEventError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete bucket event', properties, fileName);
  }
}

export class InvalidEventTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid bucket event type', undefined, 'Bucket.Event', fileName);
  }
}

export class IncorrectEventTypeError extends IncorrectTypeError {
  constructor(
    public eventType: string,
    fileName?: string
  ) {
    super('Incorrect bucket event type', eventType, 'Bucket.Event', fileName);
  }
}
