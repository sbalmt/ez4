import { IncompleteTypeError } from '@ez4/common/library';

export class IncompleteAuthorizerHandlerError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete authorizer handler', properties, fileName);
  }
}
