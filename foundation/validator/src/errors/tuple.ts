import { UnexpectedTypeError } from './common';

export class ExpectedTupleTypeError extends UnexpectedTypeError {
  public name = 'ExpectedTupleType';

  constructor(propertyName?: string) {
    super('tuple', propertyName);
  }
}
