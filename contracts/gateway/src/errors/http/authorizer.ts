import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteAuthorizerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete route authorizer', properties, fileName);
  }
}
