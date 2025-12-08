import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCorsError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CORS', properties, fileName);
  }
}

export class InvalidCorsTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid CORS', undefined, baseType, fileName);
  }
}

export class IncorrectCorsTypeError extends IncorrectTypeError {
  constructor(
    public corsType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect CORS', corsType, baseType, fileName);
  }
}
