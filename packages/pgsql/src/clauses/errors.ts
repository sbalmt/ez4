export class TooManyClausesError extends Error {
  constructor() {
    super('Multiple clauses for a single statement.');
  }
}

export class MissingClauseError extends Error {
  constructor() {
    super('Missing statement clause.');
  }
}

export class InvalidColumnOrderError extends Error {
  constructor(public columnName: string) {
    super(`Column order for ${columnName} is invalid.`);
  }
}

export class MissingJoinConditionError extends Error {
  constructor() {
    super(`Join condition for the given table is missing.`);
  }
}

export class NoStatementsError extends Error {
  constructor() {
    super(`At least one statement is required.`);
  }
}
