import { UnexpectedTypeError } from './common.js';

export class ExpectedObjectTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('object', propertyName);
  }
}
