export class MigrationValidationFailedError extends Error {
  constructor(name?: string) {
    super(`Unable to validate statement for: ${name ?? 'query'}.`);
  }
}
