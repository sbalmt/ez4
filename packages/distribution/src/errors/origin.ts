import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteOriginError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CDN origin', properties, fileName);
  }
}

export class InvalidOriginTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid CDN origin type', undefined, 'Cdn.DefaultOrigin', fileName);
  }
}

export class IncorrectOriginTypeError extends IncorrectTypeError {
  constructor(
    public originType: string,
    fileName?: string
  ) {
    super('Incorrect CDN origin type', originType, 'Cdn.DefaultOrigin', fileName);
  }
}
