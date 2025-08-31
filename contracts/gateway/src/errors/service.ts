import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteServiceError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete service', properties, fileName);
  }
}
