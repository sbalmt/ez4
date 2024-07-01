import { UnexpectedTypeError } from './common.js';

export class ExpectedTupleTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('tuple', propertyName);
  }
}
