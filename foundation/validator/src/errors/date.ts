import { UnexpectedFormatError } from '../errors/common';

export class ExpectedDateFormatError extends UnexpectedFormatError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', 'date', 'ISO 8601', propertyName, inputValue);
  }
}
