import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteTableError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete database table', properties, fileName);
  }
}
