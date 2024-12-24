export class MissingTableNameError extends Error {
  constructor() {
    super(`Table name is missing for the statement.`);
  }
}
