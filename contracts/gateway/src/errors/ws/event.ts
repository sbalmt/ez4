import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidEventTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid event', undefined, baseType, fileName);
  }
}

export class IncorrectEventTypeError extends IncorrectTypeError {
  constructor(
    public eventType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect event', eventType, baseType, fileName);
  }
}
