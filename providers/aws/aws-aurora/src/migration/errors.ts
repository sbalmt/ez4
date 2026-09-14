export class MigrationFailedError extends Error {
  constructor(errors: string[]) {
    super(`Migration failed with errors:${['', ...errors].join('\n  ')}`);
  }
}
