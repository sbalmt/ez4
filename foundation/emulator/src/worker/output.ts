import type { MessagePort } from 'node:worker_threads';

import { isAnyString } from '@ez4/utils';

import { notifyLog } from './notifier';

export const captureOutput = (worker: MessagePort, error: boolean, stream: NodeJS.WriteStream) => {
  type Callback = (error?: Error | null) => void;

  stream.write = (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | Callback, callback?: Callback) => {
    const encoding = isAnyString(encodingOrCallback) ? encodingOrCallback : undefined;
    const finished = isAnyString(encodingOrCallback) ? callback : encodingOrCallback;

    const text = isAnyString(chunk) ? chunk : Buffer.from(chunk).toString(encoding);

    notifyLog(worker, error, text);

    if (finished) {
      process.nextTick(finished);
    }

    return true;
  };
};
