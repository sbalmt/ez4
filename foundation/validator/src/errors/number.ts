import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedIntegerTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('integer', propertyName, inputValue);
  }
}

export class ExpectedNumberTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('number', propertyName, inputValue);
  }
}

export class UnexpectedMinRangeError extends UnexpectedValueError {
  constructor(inputValue: unknown, minValue: number, propertyName?: string) {
    super(`with min ${minValue}`, propertyName, minValue, inputValue);
  }
}

export class UnexpectedMaxRangeError extends UnexpectedValueError {
  constructor(inputValue: unknown, maxValue: number, propertyName?: string) {
    super(`with max ${maxValue}`, propertyName, [maxValue], inputValue);
  }
}

export class UnexpectedNumberError extends UnexpectedValueError {
  constructor(inputValue: unknown, value: number, propertyName?: string) {
    super(`${value}`, propertyName, inputValue);
  }
}
