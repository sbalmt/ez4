import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteServiceError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete topic service', properties, fileName);
  }
}
