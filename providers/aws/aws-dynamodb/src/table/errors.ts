export class InvalidTableNameError extends Error {
  constructor(tableName: string, maxLength: number) {
    super(`Table name ${tableName} exceeds ${maxLength} characters.`);
  }
}

export class TableNotFoundError extends Error {
  constructor(tableName: string) {
    super(`Table service for '${tableName}' wasn't found.`);
  }
}
