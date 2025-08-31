import { ServiceError } from '@ez4/common';

export class MalformedMessageError extends ServiceError {
  constructor(details: string[]) {
    super('Malformed notification message payload.', details);
  }
}

export class MissingMessageGroupError extends Error {
  constructor(public fieldName: string) {
    super(`Message group field ${fieldName} for the notification is missing.`);
  }
}
