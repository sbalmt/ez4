import { IncompleteTypeError, IncorrectPropertyError } from '@ez4/common/library';

export class IncompleteServiceError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete scheduler service', properties, fileName);
  }
}

export class IncorrectServiceError extends IncorrectPropertyError {
  constructor(properties: string[], fileName?: string) {
    super('Incorrect scheduler service', properties, fileName);
  }
}
