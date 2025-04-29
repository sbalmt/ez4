import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCacheError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete gateway cache', properties, fileName);
  }
}

export class InvalidCacheTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid gateway cache type', undefined, 'Http.Cache', fileName);
  }
}

export class IncorrectCacheTypeError extends IncorrectTypeError {
  constructor(
    public cacheType: string,
    fileName?: string
  ) {
    super('Incorrect gateway cache type', cacheType, 'Http.Cache', fileName);
  }
}
