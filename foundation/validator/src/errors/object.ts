import { UnexpectedTypeError } from './common';

export class ExpectedObjectTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('object', propertyName);
  }
}
