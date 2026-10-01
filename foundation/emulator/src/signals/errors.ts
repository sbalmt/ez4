import type { WorkerSignal } from './types';

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

export class CorruptedSignalError extends Error {
  constructor() {
    super('Unable to deserialize the given signal data.');
  }
}

export class UnexpectedSignalError extends Error {
  constructor(signal: WorkerSignal) {
    super(`Signal '${signal}' was not expected.`);
  }
}
