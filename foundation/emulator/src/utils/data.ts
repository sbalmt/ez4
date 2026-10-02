import type { WorkerSignals } from '../types/signal';

import { CorruptedSignalError } from '../errors/signal';

/**
 * Serialize a worker signal.
 *
 * @param signal Worker signal.
 * @returns Returns the serialized worker signal.
 */
export const serialize = (signal: WorkerSignals) => {
  return JSON.stringify(signal);
};

/**
 * Deserialize a previously serialized worker signal.
 *
 * @param data Serialized worked signal.
 * @returns Returns the deserialized worker signal object.
 */
export const deserialize = (data: string): WorkerSignals => {
  try {
    return JSON.parse(data);
  } catch {
    throw new CorruptedSignalError();
  }
};
