import { IncompleteTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidContextTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid route context', undefined, baseType, fileName);
  }
}

export class IncompleteContextError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete route context', properties, fileName);
  }
}
