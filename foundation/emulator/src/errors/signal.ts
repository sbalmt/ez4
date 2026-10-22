import type { WorkerSignal } from '../types/signal';

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
