import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidParameterTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid request parameters', undefined, 'Http.PathParameters', fileName);
  }
}

export class IncorrectParameterTypeError extends IncorrectTypeError {
  constructor(
    public parametersType: string,
    fileName?: string
  ) {
    super('Incorrect request parameters', parametersType, 'Http.PathParameters', fileName);
  }
}
