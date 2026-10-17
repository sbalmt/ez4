import type { Duplex } from 'node:stream';

export const isStreamLive = (stream: Duplex) => {
  return !stream.destroyed && !stream.writableEnded && !stream.closed;
};
