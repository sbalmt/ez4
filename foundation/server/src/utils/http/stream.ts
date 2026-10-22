import type { ServerResponse } from 'node:http';

export const canSendHttpReply = (stream: ServerResponse) => {
  return !stream.destroyed && !stream.headersSent && !stream.writableEnded;
};
