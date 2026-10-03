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

export class WorkerTerminatedError extends Error {
  constructor(readonly code: number) {
    super(`Worker terminated with code ${code} before any response.`);
  }
}

export class WorkerMemoryLimitError extends Error {
  constructor() {
    super(`Worker exceeded its memory limit before any response.`);
  }
}
