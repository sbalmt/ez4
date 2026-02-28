export class MigrationDeletionDeniedError extends Error {
  constructor(databaseName: string) {
    super(`Deletion protection for database ${databaseName} is enabled.`);
  }
}
