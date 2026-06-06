import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedBooleanTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('boolean', propertyName, inputValue);
  }
}

export class UnexpectedBooleanError extends UnexpectedValueError {
  constructor(inputValue: boolean, expectedValue: boolean, propertyName?: string) {
    super(`${expectedValue}`, propertyName, expectedValue, inputValue);
  }
}
