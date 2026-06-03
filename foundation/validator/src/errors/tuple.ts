import { UnexpectedTypeError } from './common';

export class ExpectedTupleTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('tuple', propertyName, inputValue);
  }
}
