import { UnexpectedFormatError } from './common';

export class ExpectedRegexFormatError extends UnexpectedFormatError {
  constructor(inputValue: unknown, formatName?: string, propertyName?: string) {
    super('string', formatName ?? 'regex', undefined, propertyName, inputValue);
  }
}
