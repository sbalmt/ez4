export class MissingTableError extends Error {
  constructor() {
    super(`Table name is missing for the statement.`);
  }
}
