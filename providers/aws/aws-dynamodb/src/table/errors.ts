export class TableNotFoundError extends Error {
  constructor(tableName: string) {
    super(`Table service ${tableName} wasn't found.`);
  }
}

export class TableDeletionDeniedError extends Error {
  constructor(tableName: string) {
    super(`Deletion protection for table ${tableName} is enabled.`);
  }
}
