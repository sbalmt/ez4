export class MigrationAssertionFailedError extends Error {
  constructor(name?: string) {
    super(`Unable to assert statement for: ${name ?? 'query'}.`);
  }
}
