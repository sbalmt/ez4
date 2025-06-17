export class MissingColumnAliasError extends Error {
  constructor() {
    super(`Column alias for the declaration is missing.`);
  }
}

export class InvalidColumnOrderError extends Error {
  constructor(public columnName: string) {
    super(`Column order for ${columnName} is invalid.`);
  }
}

export class MissingTableAliasError extends Error {
  constructor() {
    super(`Table alias for the declaration is missing.`);
  }
}

export class MissingTableNameError extends Error {
  constructor() {
    super(`Table name for the declaration is missing.`);
  }
}

export class MissingJoinConditionError extends Error {
  constructor() {
    super(`Join condition for the given table is missing.`);
  }
}

export class MissingRecordError extends Error {
  constructor() {
    super(`Record for the declaration is missing.`);
  }
}

export class EmptyRecordError extends Error {
  constructor() {
    super(`Record for the declaration is empty.`);
  }
}

export class NoColumnsError extends Error {
  constructor() {
    super(`At least one column for the declaration is required.`);
  }
}

export class NoStatementsError extends Error {
  constructor() {
    super(`At least one declaration is required.`);
  }
}
