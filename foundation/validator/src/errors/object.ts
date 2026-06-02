import { UnexpectedTypeError } from './common';

export class ExpectedObjectTypeError extends UnexpectedTypeError {
  public name = 'ExpectedObjectType';

  constructor(propertyName?: string) {
    super('object', propertyName);
  }
}
