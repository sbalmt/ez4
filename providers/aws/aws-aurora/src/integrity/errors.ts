export class IntegrityCheckFailedError extends Error {
  constructor(errors: string[]) {
    const allErrors = errors.map((error) => `\n  ${error}`);
    super(`Integrity check failed with errors:${allErrors}`);
  }
}

export class IntegrityCheckError extends Error {
  constructor(name: string) {
    super(`Integrity check failed for ${name}`);
  }
}
