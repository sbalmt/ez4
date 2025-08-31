import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteHandlerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete route handler', properties, fileName);
  }
}
