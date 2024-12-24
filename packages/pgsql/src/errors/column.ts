export class MissingColumnAliasError extends Error {
  constructor() {
    super(`Column alias is missing for the statement.`);
  }
}

export class InvalidColumnOrderError extends Error {
  constructor(public columnName: string) {
    super(`Column ${columnName} must use Order.Asc or Order.Desc in the order parameter.`);
  }
}
