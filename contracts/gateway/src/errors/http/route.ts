import { IncompleteTypeError, TypeError } from '@ez4/common/library';

export class IncompleteRouteError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete gateway route', properties, fileName);
  }
}

export class InvalidRouteErrorTypeError extends TypeError {
  constructor(fileName?: string) {
    super('Invalid route error type.', fileName);
  }
}
