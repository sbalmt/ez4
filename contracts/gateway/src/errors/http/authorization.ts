import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteAuthorizationError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete authorization', properties, fileName);
  }
}

export class InvalidAuthorizationTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid authorization', undefined, baseType, fileName);
  }
}

export class IncorrectAuthorizationTypeError extends IncorrectTypeError {
  constructor(
    public authorizationType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect authorization', authorizationType, baseType, fileName);
  }
}
