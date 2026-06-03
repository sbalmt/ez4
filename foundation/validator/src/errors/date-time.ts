import { UnexpectedFormatError } from '../errors/common';

export class ExpectedDateTimeFormatError extends UnexpectedFormatError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', 'date-time', 'ISO 8601', propertyName, inputValue);
  }
}
