import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCorsError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete HTTP CORS', properties, fileName);
  }
}

export class InvalidCorsTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid HTTP CORS type', undefined, 'Http.Cors', fileName);
  }
}

export class IncorrectCorsTypeError extends IncorrectTypeError {
  constructor(
    public fallbackType: string,
    fileName?: string
  ) {
    super('Incorrect HTTP CORS type', fallbackType, 'Http.Cors', fileName);
  }
}
