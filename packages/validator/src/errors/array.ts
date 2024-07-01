import { UnexpectedTypeError } from './common.js';

export class ExpectedArrayTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('array', propertyName);
  }
}
