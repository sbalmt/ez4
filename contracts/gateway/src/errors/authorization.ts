import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteAuthorizationError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete gateway authorization', properties, fileName);
  }
}

export class InvalidAuthorizationTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid authorization', undefined, 'Http.Authorization', fileName);
  }
}

export class IncorrectAuthorizationTypeError extends IncorrectTypeError {
  constructor(
    public authorizationType: string,
    fileName?: string
  ) {
    super('Incorrect authorization', authorizationType, 'Http.Authorization', fileName);
  }
}
