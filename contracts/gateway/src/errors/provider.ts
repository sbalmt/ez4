import { IncompleteTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidProviderTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid route provider', undefined, baseType, fileName);
  }
}

export class IncompleteProviderError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete route provider', properties, fileName);
  }
}
