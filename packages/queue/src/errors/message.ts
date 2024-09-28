import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidMessageTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid message type', undefined, 'Queue.Message', fileName);
  }
}

export class IncorrectMessageTypeError extends IncorrectTypeError {
  constructor(
    public messageType: string,
    fileName?: string
  ) {
    super('Incorrect message type', messageType, 'Queue.Message', fileName);
  }
}
