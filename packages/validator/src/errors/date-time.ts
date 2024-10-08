import { UnexpectedFormatError } from '../errors/common.js';

export class ExpectedDateTimeTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'date-time (ISO 8601)', propertyName);
  }
}
