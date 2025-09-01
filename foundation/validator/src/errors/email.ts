import { UnexpectedFormatError } from '../errors/common';

export class ExpectedEmailTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'email', propertyName);
  }
}
