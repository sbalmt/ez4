export class IntegrityCheckFailedError extends Error {
  constructor(errors: string[]) {
    const allErrors = errors.map((error) => `\n  ${error}`);
    super(`Integrity check failed with errors:${allErrors}`);
  }
}

export class IntegrityCheckError extends Error {
  constructor() {
    super(`Integrity check error.`);
  }
}
