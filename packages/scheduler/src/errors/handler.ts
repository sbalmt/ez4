import { IncompleteTypeError, IncorrectPropertyError } from '@ez4/common/library';

export class IncompleteHandlerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete scheduler handler', properties, fileName);
  }
}

export class IncorrectHandlerError extends IncorrectPropertyError {
  constructor(properties: string[], fileName?: string) {
    super('Incorrect scheduler handler', properties, fileName);
  }
}
