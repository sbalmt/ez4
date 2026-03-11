import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedArrayTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('array', propertyName);
  }
}

export class UnexpectedMinItemsError extends UnexpectedValueError {
  constructor(minValue: number, propertyName?: string) {
    super([`with min ${minValue} item(s)`], propertyName);
  }
}

export class UnexpectedMaxItemsError extends UnexpectedValueError {
  constructor(maxValue: number, propertyName?: string) {
    super([`with max ${maxValue} item(s)`], propertyName);
  }
}
