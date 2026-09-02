export class IntegrityStateNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Integrity state for service '${serviceName}' wasn't found.`);
  }
}

export class IntegrityCheckFailedError extends Error {
  constructor(errors: string[]) {
    super(`Integrity check failed with errors:${['', ...errors].join('\n  ')}`);
  }
}

export class IntegrityCheckError extends Error {
  constructor(name: string) {
    super(`Integrity check failed for '${name}'`);
  }
}
