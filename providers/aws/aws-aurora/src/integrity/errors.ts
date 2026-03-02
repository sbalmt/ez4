export class IntegrityCheckFailureError extends Error {
  constructor(errors: string[]) {
    const allErrors = errors.map((error) => `\n  ${error}`);
    super(`Integrity check failed with errors:${allErrors}`);
  }
}
