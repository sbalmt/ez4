export class MigrationFailedError extends Error {
  constructor(errors: string[]) {
    const allErrors = errors.map((error) => `\n  ${error}`);
    super(`Migration failed with errors:${allErrors}`);
  }
}
