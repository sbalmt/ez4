import { UnexpectedTypeError } from './common.js';

export class ExpectedBooleanTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('boolean', propertyName);
  }
}
