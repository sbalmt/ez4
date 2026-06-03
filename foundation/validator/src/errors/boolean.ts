import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedBooleanTypeError extends UnexpectedTypeError {
  public name = 'ExpectedBooleanType';

  constructor(propertyName?: string) {
    super('boolean', propertyName);
  }
}

export class UnexpectedBooleanError extends UnexpectedValueError {
  public name = 'UnexpectedBoolean';

  constructor(value: boolean, propertyName?: string) {
    super(`${value}`, propertyName, value);
  }
}
