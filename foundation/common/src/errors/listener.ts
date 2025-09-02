import { IncompleteTypeError } from './common';

export class IncompleteListenerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete service listener.', properties, fileName);
  }
}
