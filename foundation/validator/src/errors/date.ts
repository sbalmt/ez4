import { UnexpectedFormatError } from '../errors/common';

export class ExpectedDateTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'date (ISO 8601)', propertyName);
  }
}
