import { UnexpectedTypeError, UnexpectedValueError } from './common.js';

export class ExpectedArrayTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('array', propertyName);
  }
}

export class UnexpectedMinItemsError extends UnexpectedValueError {
  constructor(minValue: number, propertyName?: string) {
    super([`with min items ${minValue}`], propertyName);
  }
}

export class UnexpectedMaxItemsError extends UnexpectedValueError {
  constructor(maxValue: number, propertyName?: string) {
    super([`with max items ${maxValue}`], propertyName);
  }
}
