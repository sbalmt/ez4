import { UnexpectedFormatError } from './common';

export class ExpectedBase64TypeError extends UnexpectedFormatError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', 'base64', undefined, propertyName, inputValue);
  }
}
