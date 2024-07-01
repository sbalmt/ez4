import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteRouteError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete service route', properties, fileName);
  }
}
