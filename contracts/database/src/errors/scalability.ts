import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteScalabilityError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete database scalability', properties, fileName);
  }
}
