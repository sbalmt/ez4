import { UnexpectedFormatError } from '../errors/common.js';

export class ExpectedUUIDTypeError extends UnexpectedFormatError {
  constructor(propertyName?: string) {
    super('string', 'UUID', propertyName);
  }
}
