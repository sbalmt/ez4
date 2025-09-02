import { UnexpectedTypeError } from './common';

export class ExpectedTupleTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('tuple', propertyName);
  }
}
