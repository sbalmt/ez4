import { UnexpectedFormatError } from '../errors/common';

export class ExpectedEmailFormatError extends UnexpectedFormatError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', 'email', undefined, propertyName, inputValue);
  }
}
