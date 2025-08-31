import { UnexpectedFormatError } from './common.js';

export class ExpectedRegexTypeError extends UnexpectedFormatError {
  constructor(formatName?: string, propertyName?: string) {
    super('string', formatName ?? 'regex', propertyName);
  }
}
