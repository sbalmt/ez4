import { UnexpectedFormatError } from './common';

export class ExpectedBase64TypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'base64', propertyName);
  }
}
