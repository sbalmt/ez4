import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteTargetError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete target', properties, fileName);
  }
}
