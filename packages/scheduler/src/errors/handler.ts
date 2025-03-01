import { IncompleteTypeError, TypeError } from '@ez4/common/library';

export class IncompleteHandlerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete scheduler handler', properties, fileName);
  }
}

export class InvalidHandlerError extends TypeError {
  constructor(fileName?: string) {
    super('Invalid scheduler handler', fileName);
  }
}
