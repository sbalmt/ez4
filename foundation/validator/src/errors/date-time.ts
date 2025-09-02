import { UnexpectedFormatError } from '../errors/common';

export class ExpectedDateTimeTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'date-time (ISO 8601)', propertyName);
  }
}
