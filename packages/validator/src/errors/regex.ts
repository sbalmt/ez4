import { UnexpectedFormatError } from './common.js';

export class ExpectedRegexTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'regex', propertyName);
  }
}
