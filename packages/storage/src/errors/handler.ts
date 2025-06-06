import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteHandlerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete event handler', properties, fileName);
  }
}
