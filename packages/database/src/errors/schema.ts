import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidSchemaTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid table schema type', undefined, 'Database.Schema', fileName);
  }
}

export class IncorrectSchemaTypeError extends IncorrectTypeError {
  constructor(
    public schemaType: string,
    fileName?: string
  ) {
    super('Incorrect table schema type', schemaType, 'Database.Schema', fileName);
  }
}
