import { UnexpectedTypeError, UnexpectedValueError } from './common.js';

export class ExpectedStringTypeError extends UnexpectedTypeError {
  constructor(propertyName?: string) {
    super('string', propertyName);
  }
}

export class UnexpectedMinLengthError extends UnexpectedValueError {
  constructor(minValue: number, propertyName?: string) {
    super([`with min length ${minValue}`], propertyName);
  }
}

export class UnexpectedMaxLengthError extends UnexpectedValueError {
  constructor(maxValue: number, propertyName?: string) {
    super([`with max length ${maxValue}`], propertyName);
  }
}
