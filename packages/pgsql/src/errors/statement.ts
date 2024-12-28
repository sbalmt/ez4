export class NoStatementsError extends Error {
  constructor() {
    super(`At least one statement is required.`);
  }
}
