import { UnexpectedFormatError } from '../errors/common';

export class ExpectedDateTimeFormatError extends UnexpectedFormatError {
  public name = 'ExpectedDateTimeFormat';

  constructor(propertyName?: string) {
    super('string', 'date-time (ISO 8601)', propertyName);
  }
}
