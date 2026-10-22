import type { WorkerErrorSignal } from '../types/signal';

type EventPromise = {
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
};

const ALL_PROMISES = new Map<string, EventPromise>();

export const resolveReply = (id: string, response: unknown) => {
  const promise = ALL_PROMISES.get(id);

  if (promise) {
    ALL_PROMISES.delete(id);
    promise.resolve(response);
  }
};

export const rejectReply = (id: string, data: WorkerErrorSignal['error']) => {
  const promise = ALL_PROMISES.get(id);

  if (promise) {
    const error = new Error(data.message);

    error.name = data.name;
    error.stack = data.stack;

    ALL_PROMISES.delete(id);
    promise.reject(error);
  }
};

export const waitForReply = (id: string) => {
  return new Promise((resolve, reject) => {
    ALL_PROMISES.set(id, { resolve, reject });
  });
};
