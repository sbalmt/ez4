import { UnexpectedFormatError } from '../errors/common';

export class ExpectedDateFormatError extends UnexpectedFormatError {
  public name = 'ExpectedDateFormat';

  constructor(propertyName?: string) {
    super('string', 'date', 'ISO 8601', propertyName);
  }
}
