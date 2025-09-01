import { UnexpectedFormatError } from '../errors/common';

export class ExpectedUUIDTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'UUID', propertyName);
  }
}
