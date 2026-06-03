import { UnexpectedFormatError } from '../errors/common';

export class ExpectedTimeFormatError extends UnexpectedFormatError {
  public name = 'ExpectedTimeFormat';

  constructor(propertyName?: string) {
    super('string', 'time', 'ISO 8601', propertyName);
  }
}
