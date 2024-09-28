import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteFallbackError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CDN fallback', properties, fileName);
  }
}

export class InvalidFallbackTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid CDN fallback type', undefined, 'Cdn.Fallback', fileName);
  }
}

export class IncorrectFallbackTypeError extends IncorrectTypeError {
  constructor(
    public fallbackType: string,
    fileName?: string
  ) {
    super('Incorrect CDN fallback type', fallbackType, 'Cdn.Fallback', fileName);
  }
}
