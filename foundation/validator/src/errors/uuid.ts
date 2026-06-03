import { UnexpectedFormatError } from '../errors/common';

export class ExpectedUUIDTypeError extends UnexpectedFormatError {
  public name = 'ExpectedUUIDType';

  constructor(propertyName?: string) {
    super('string', 'UUID', undefined, propertyName);
  }
}
