import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedIntegerTypeError extends UnexpectedTypeError {
  public name = 'ExpectedIntegerType';

  constructor(propertyName?: string) {
    super('integer', propertyName);
  }
}

export class ExpectedNumberTypeError extends UnexpectedTypeError {
  public name = 'ExpectedNumberType';

  constructor(propertyName?: string) {
    super('number', propertyName);
  }
}

export class UnexpectedMinRangeError extends UnexpectedValueError {
  public name = 'UnexpectedMinRange';

  constructor(minValue: number, propertyName?: string) {
    super(`with min ${minValue}`, propertyName, minValue);
  }
}

export class UnexpectedMaxRangeError extends UnexpectedValueError {
  public name = 'UnexpectedMaxRange';

  constructor(maxValue: number, propertyName?: string) {
    super(`with max ${maxValue}`, propertyName, [maxValue]);
  }
}

export class UnexpectedNumberError extends UnexpectedValueError {
  public name = 'UnexpectedNumber';

  constructor(value: number, propertyName?: string) {
    super(`${value}`, propertyName);
  }
}
