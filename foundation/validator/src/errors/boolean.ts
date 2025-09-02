import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedBooleanTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('boolean', propertyName);
  }
}

export class UnexpectedBooleanError extends UnexpectedValueError {
  constructor(value: boolean, propertyName?: string) {
    super([`${value}`], propertyName);
  }
}
