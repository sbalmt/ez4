import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteSubscriptionError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete queue subscription', properties, fileName);
  }
}
