import { UnexpectedFormatError } from '../errors/common';

export class ExpectedUUIDTypeError extends UnexpectedFormatError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', 'UUID', undefined, propertyName, inputValue);
  }
}
