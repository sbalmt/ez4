export class TableNotFoundError extends Error {
  constructor(tableName: string) {
    super(`Table service for '${tableName}' wasn't found.`);
  }
}
