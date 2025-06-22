import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteEngineError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete database engine', properties, fileName);
  }
}
