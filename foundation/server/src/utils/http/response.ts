import type { ServerResponse } from 'node:http';

export const canSendReply = (stream: ServerResponse) => {
  return !stream.destroyed && !stream.headersSent && !stream.writableEnded;
};

export const hasVaryHeader = (values: string[], header: string) => {
  const tokens = ['*', header.toLowerCase()];

  return values.some((token) => {
    return tokens.includes(token.toLowerCase());
  });
};
