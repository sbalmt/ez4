import { UnexpectedTypeError, UnexpectedValueError } from './common.js';

export class ExpectedIntegerTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('integer', propertyName);
  }
}

export class ExpectedNumberTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('number', propertyName);
  }
}

export class UnexpectedMinRangeError extends UnexpectedValueError {
  constructor(minValue: number, propertyName?: string) {
    super([`with min ${minValue}`], propertyName);
  }
}

export class UnexpectedMaxRangeError extends UnexpectedValueError {
  constructor(maxValue: number, propertyName?: string) {
    super([`with max ${maxValue}`], propertyName);
  }
}

export class UnexpectedNumberError extends UnexpectedValueError {
  constructor(value: number, propertyName?: string) {
    super([`${value}`], propertyName);
  }
}
