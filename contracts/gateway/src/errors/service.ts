import { IncompleteTypeError, TypeCollisionError } from '@ez4/common/library';

export class IncompleteServiceError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete service', properties, fileName);
  }
}

export class ServiceCollisionError extends TypeCollisionError {
  constructor(property: string, fileName?: string) {
    super('Service error', property, fileName);
  }
}
