import { UnexpectedFormatError } from '../errors/common';

export class ExpectedTimeFormatError extends UnexpectedFormatError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', 'time', 'ISO 8601', propertyName, inputValue);
  }
}
