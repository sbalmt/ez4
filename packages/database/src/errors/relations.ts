import { IncorrectTypeError, InvalidTypeError, TypeError } from '@ez4/common/library';

export class InvalidRelationsTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid table relations type', undefined, 'Database.Relations', fileName);
  }
}

export class IncorrectRelationsTypeError extends IncorrectTypeError {
  constructor(
    public schemaType: string,
    fileName?: string
  ) {
    super('Incorrect table relations type', schemaType, 'Database.Relations', fileName);
  }
}

export class InvalidRelationPatternError extends TypeError {
  constructor(
    public relationTable: string,
    fileName?: string
  ) {
    super(
      `Invalid relation, ${relationTable} must follow the pattern 'alias:field' or 'alias'.`,
      fileName
    );
  }
}

export class InvalidRelationTableError extends TypeError {
  constructor(
    public relationTable: string,
    fileName?: string
  ) {
    super(`Invalid relation, ${relationTable} must be valid table.`, fileName);
  }
}

export class InvalidRelationColumnError extends TypeError {
  constructor(
    public relationTable: string,
    public relationColumn: string,
    fileName?: string
  ) {
    super(
      `Invalid relation, column ${relationColumn} must exists on ${relationTable} table.`,
      fileName
    );
  }
}
