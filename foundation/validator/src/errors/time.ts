import { UnexpectedFormatError } from '../errors/common';

export class ExpectedTimeTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'time (ISO 8601)', propertyName);
  }
}
