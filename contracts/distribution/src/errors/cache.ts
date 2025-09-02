import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCacheError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CDN cache', properties, fileName);
  }
}

export class InvalidCacheTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid CDN cache type', undefined, 'Cdn.Cache', fileName);
  }
}

export class IncorrectCacheTypeError extends IncorrectTypeError {
  constructor(
    public cacheType: string,
    fileName?: string
  ) {
    super('Incorrect CDN cache type', cacheType, 'Cdn.Cache', fileName);
  }
}
