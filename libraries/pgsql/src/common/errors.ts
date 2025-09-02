export class MissingColumnAliasError extends Error {
  constructor() {
    super(`Column alias for the statement is missing.`);
  }
}

export class MissingTableAliasError extends Error {
  constructor() {
    super(`Table alias for the statement is missing.`);
  }
}
