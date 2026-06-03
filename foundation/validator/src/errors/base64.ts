import { UnexpectedFormatError } from './common';

export class ExpectedBase64TypeError extends UnexpectedFormatError {
  public name = 'ExpectedBase64Type';

  constructor(propertyName?: string) {
    super('string', 'base64', undefined, propertyName);
  }
}
