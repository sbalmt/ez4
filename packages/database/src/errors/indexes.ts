import { IncorrectTypeError, InvalidTypeError, TypeError } from '@ez4/common/library';

export class InvalidIndexesTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid table indexes type', undefined, 'Database.Indexes', fileName);
  }
}

export class IncorrectIndexesTypeError extends IncorrectTypeError {
  constructor(
    public schemaType: string,
    fileName?: string
  ) {
    super('Incorrect table indexes type', schemaType, 'Database.Indexes', fileName);
  }
}

export class InvalidIndexTypeError extends TypeError {
  constructor(
    public indexName: string,
    fileName?: string
  ) {
    super(`Invalid index type, ${indexName} must follow one of the Index options.`, fileName);
  }
}

export class InvalidIndexReferenceError extends TypeError {
  constructor(
    public indexName: string,
    fileName?: string
  ) {
    super(`Invalid index reference, ${indexName} must be valid column.`, fileName);
  }
}
