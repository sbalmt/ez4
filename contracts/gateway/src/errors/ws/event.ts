import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidEventTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid event type', undefined, 'Ws.Event', fileName);
  }
}

export class IncorrectEventTypeError extends IncorrectTypeError {
  constructor(
    public eventType: string,
    fileName?: string
  ) {
    super('Incorrect event type', eventType, 'Ws.Event', fileName);
  }
}
