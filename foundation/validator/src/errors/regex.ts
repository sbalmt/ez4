import { UnexpectedFormatError } from './common';

export class ExpectedRegexFormatError extends UnexpectedFormatError {
  public name = 'ExpectedRegexFormat';

  constructor(formatName?: string, propertyName?: string) {
    super('string', formatName ?? 'regex', undefined, propertyName);
  }
}
