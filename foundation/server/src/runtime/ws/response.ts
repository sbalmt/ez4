import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import type { WsCode } from '../../types/ws';

import { isStreamLive } from '../../utils/ws/stream';
import { encodeWsCloseFrame } from '../../utils/ws/frame';
import { getWsAccept } from '../../utils/ws/handshake';
import { logFailure, logSuccess } from '../../utils/logger';

export const replyWsSuccess = (stream: Duplex, request: IncomingMessage, headerKey: string) => {
  logSuccess(101, request.url);

  const acceptKey = getWsAccept(headerKey);

  stream.write(
    `HTTP/1.1 101 Switching Protocols\r\n` +
      `Upgrade: websocket\r\n` +
      `Connection: Upgrade\r\n` +
      `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
  );
};

export const replyWsError = (stream: Duplex, request: IncomingMessage, status: number, message: string) => {
  logFailure(status, request.url);

  if (!isStreamLive(stream)) {
    return;
  }

  const body = JSON.stringify({ type: 'error', message });

  stream.end(
    `HTTP/1.1 ${status} Error\r\n` +
      `Content-Type: application/json\r\n` +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      `Connection: close\r\n\r\n` +
      `${body}`
  );
};

export const replyWsClose = (stream: Duplex, code?: WsCode) => {
  if (isStreamLive(stream)) {
    stream.end(encodeWsCloseFrame(code));
  }
};
