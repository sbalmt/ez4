import { UnexpectedFormatError } from '../errors/common';

export class ExpectedEmailFormatError extends UnexpectedFormatError {
  public name = 'ExpectedEmailFormat';

  constructor(propertyName?: string) {
    super('string', 'email', undefined, propertyName);
  }
}
