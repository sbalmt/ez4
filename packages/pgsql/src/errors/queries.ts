export class MissingColumnAliasError extends Error {
  constructor() {
    super(`Column alias for the statement is missing.`);
  }
}

export class InvalidColumnOrderError extends Error {
  constructor(public columnName: string) {
    super(`Column order for ${columnName} is invalid.`);
  }
}

export class MissingTableNameError extends Error {
  constructor() {
    super(`Table name for the statement is missing.`);
  }
}

export class MissingJoinConditionError extends Error {
  constructor() {
    super(`Join condition for the given table is missing.`);
  }
}

export class MissingRecordError extends Error {
  constructor() {
    super(`Record for the statement is missing.`);
  }
}

export class EmptyRecordError extends Error {
  constructor() {
    super(`Record for the statement is empty.`);
  }
}

export class NoColumnsError extends Error {
  constructor() {
    super(`At least one column for the statement is required.`);
  }
}

export class NoStatementsError extends Error {
  constructor() {
    super(`At least one statement is required.`);
  }
}
