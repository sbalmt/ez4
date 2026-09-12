export class UnsupportedSqlDataError extends Error {
  constructor() {
    super(`Unsupported SQL data type encountered.`);
  }
}
