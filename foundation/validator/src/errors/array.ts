import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedArrayTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('array', propertyName, inputValue);
  }
}

export class UnexpectedMinItemsError extends UnexpectedValueError {
  constructor(inputValue: unknown, minValue: number, propertyName?: string) {
    super(`with min ${minValue} item(s)`, propertyName, minValue, inputValue);
  }
}

export class UnexpectedMaxItemsError extends UnexpectedValueError {
  constructor(inputValue: unknown, maxValue: number, propertyName?: string) {
    super(`with max ${maxValue} item(s)`, propertyName, maxValue, inputValue);
  }
}
