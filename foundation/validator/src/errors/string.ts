import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedStringTypeError extends UnexpectedTypeError {
  public name = 'ExpectedStringType';

  constructor(propertyName?: string) {
    super('string', propertyName);
  }
}

export class UnexpectedMinLengthError extends UnexpectedValueError {
  public name = 'UnexpectedMinLength';

  constructor(minValue: number, propertyName?: string) {
    super(`with min length (${minValue})`, propertyName, minValue);
  }
}

export class UnexpectedMaxLengthError extends UnexpectedValueError {
  public name = 'UnexpectedMaxLength';

  constructor(maxValue: number, propertyName?: string) {
    super(`with max length (${maxValue})`, propertyName, maxValue);
  }
}

export class UnexpectedStringError extends UnexpectedValueError {
  public name = 'UnexpectedString';

  constructor(value: string, propertyName?: string) {
    super(`'${value}'`, propertyName, value);
  }
}
