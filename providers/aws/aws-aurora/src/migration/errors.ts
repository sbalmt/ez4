export class MigrationFailedError extends Error {
  constructor(errors: string[]) {
    const allErrors = errors.map((error) => `\n  ${error}`);
    super(`Migration failed with errors:${allErrors}`);
  }
}

export class MigrationAssertionFailedError extends Error {
  constructor() {
    super(`Unable to assert migration statement.`);
  }
}
