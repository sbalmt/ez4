import { UnexpectedFormatError } from '../errors/common.js';

export class ExpectedEmailTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'email', propertyName);
  }
}
