import { UnexpectedTypeError, UnexpectedValueError } from './common';

export class ExpectedStringTypeError extends UnexpectedTypeError {
  constructor(inputValue: unknown, propertyName?: string) {
    super('string', propertyName, inputValue);
  }
}

export class UnexpectedMinLengthError extends UnexpectedValueError {
  constructor(inputValue: unknown, minValue: number, propertyName?: string) {
    super(`with min length (${minValue})`, propertyName, minValue, inputValue);
  }
}

export class UnexpectedMaxLengthError extends UnexpectedValueError {
  constructor(inputValue: unknown, maxValue: number, propertyName?: string) {
    super(`with max length (${maxValue})`, propertyName, maxValue, inputValue);
  }
}

export class UnexpectedStringError extends UnexpectedValueError {
  constructor(inputValue: unknown, value: string, propertyName?: string) {
    super(`'${value}'`, propertyName, value, inputValue);
  }
}
