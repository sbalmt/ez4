import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCacheError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete cache', properties, fileName);
  }
}

export class InvalidCacheTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid cache', undefined, baseType, fileName);
  }
}

export class IncorrectCacheTypeError extends IncorrectTypeError {
  constructor(
    public cacheType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect cache', cacheType, baseType, fileName);
  }
}
