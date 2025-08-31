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

export class InvalidRelationTargetError extends TypeError {
  constructor(
    public relationSource: string,
    fileName?: string
  ) {
    super(`Target ${relationSource} must follow the pattern 'column@alias'.`, fileName);
  }
}

export class InvalidRelationTableError extends TypeError {
  constructor(
    public relationTable: string,
    fileName?: string
  ) {
    super(`Relation table ${relationTable} don't exists.`, fileName);
  }
}

export class InvalidRelationColumnError extends TypeError {
  constructor(
    public relationColumn: string,
    fileName?: string
  ) {
    super(`Relation column ${relationColumn} don't exists.`, fileName);
  }
}

export class InvalidRelationAliasError extends TypeError {
  constructor(
    public relationAlias: string,
    fileName?: string
  ) {
    super(`Relation alias ${relationAlias} can't override table columns.`, fileName);
  }
}
