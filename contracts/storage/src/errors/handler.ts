import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteHandlerError extends IncompleteTypeError {
  constructor(fileName?: string) {
    super('Incomplete event handler', [], fileName);
  }
}
