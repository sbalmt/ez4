import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedArrayTypeError extends UnexpectedTypeError {
  public name = 'ExpectedArrayType';

  constructor(propertyName?: string) {
    super('array', propertyName);
  }
}

export class UnexpectedMinItemsError extends UnexpectedValueError {
  public name = 'UnexpectedMinItems';

  constructor(minValue: number, propertyName?: string) {
    super([`with min ${minValue} item(s)`], propertyName, [minValue]);
  }
}

export class UnexpectedMaxItemsError extends UnexpectedValueError {
  public name = 'UnexpectedMaxItems';

  constructor(maxValue: number, propertyName?: string) {
    super([`with max ${maxValue} item(s)`], propertyName, [maxValue]);
  }
}
