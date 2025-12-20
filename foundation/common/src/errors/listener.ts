import { IncompleteTypeError } from './common';

export class IncompleteListenerError extends IncompleteTypeError {
  constructor(fileName?: string) {
    super('Incomplete service listener.', [], fileName);
  }
}
