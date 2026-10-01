export class WorkerUnavailableError extends Error {
  constructor() {
    super('Worker is unavailable.');
  }
}

export class WorkerNotInitializedError extends Error {
  constructor() {
    super('Worker handler has not been initialized.');
  }
}

export class EntrypointNotFoundError extends Error {
  constructor(name: string, file: string) {
    super(`Entrypoint '${name}' was not found in '${file}'.`);
  }
}
