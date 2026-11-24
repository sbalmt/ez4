import { IncompleteTypeError } from './common';

export class IncompleteMiddlewareError extends IncompleteTypeError {
  constructor(fileName?: string) {
    super('Incomplete service middleware.', [], fileName);
  }
}
