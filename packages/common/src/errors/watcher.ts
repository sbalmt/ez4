import { IncompleteTypeError } from './common.js';

export class IncompleteWatcherError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete service watcher', properties, fileName);
  }
}
