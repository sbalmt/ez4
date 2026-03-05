export class MigrationDeletionDeniedError extends Error {
  constructor(databaseName: string) {
    super(`Deletion protection for database ${databaseName} is enabled.`);
  }
}

export class MigrationFailedError extends Error {
  constructor(errors: string[]) {
    const allErrors = errors.map((error) => `\n  ${error}`);
    super(`Migration failed with errors:${allErrors}`);
  }
}
