import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncorrectMessageTypeError extends IncorrectTypeError {
  constructor(
    public messageType: string,
    fileName?: string
  ) {
    super('Incorrect queue message type', messageType, 'Queue.Message', fileName);
  }
}

export class InvalidMessageTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid queue message type', undefined, 'Queue.Message', fileName);
  }
}
