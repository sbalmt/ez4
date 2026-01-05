import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteScalabilityError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete database scalability', properties, fileName);
  }
}

export class InvalidScalabilityTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid database scalability type', undefined, 'Database.Scalability', fileName);
  }
}

export class IncorrectScalabilityTypeError extends IncorrectTypeError {
  constructor(
    public scalabilityType: string,
    fileName?: string
  ) {
    super('Incorrect database scalability type', scalabilityType, 'Database.Scalability', fileName);
  }
}
