import { ServiceError } from '@ez4/common';

export class MalformedMessageError extends ServiceError {
  constructor(details: string[]) {
    super('Malformed queue message payload.', details);
  }
}

export class MissingMessageGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Message group field ${fieldName} for the queue is missing.`);
  }
}
