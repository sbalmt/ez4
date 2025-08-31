import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCorsError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete bucket CORS', properties, fileName);
  }
}

export class InvalidCorsTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid bucket CORS type', undefined, 'Bucket.Cors', fileName);
  }
}

export class IncorrectCorsTypeError extends IncorrectTypeError {
  constructor(
    public fallbackType: string,
    fileName?: string
  ) {
    super('Incorrect bucket CORS type', fallbackType, 'Bucket.Cors', fileName);
  }
}
