import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteStreamError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete table stream', properties, fileName);
  }
}
