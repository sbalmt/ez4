import { UnexpectedTypeError } from './common';

export class ExpectedObjectTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('object', propertyName, inputValue);
  }
}
