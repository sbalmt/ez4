import { UnexpectedFormatError } from './common';

export class ExpectedRegexTypeError extends UnexpectedFormatError {
  constructor(formatName?: string, propertyName?: string) {
    super('string', formatName ?? 'regex', propertyName);
  }
}
