import type { IncomingMessage } from 'node:http';
import type { Stream } from 'node:stream';
import type { ServiceEmulators } from '../emulator/service';
import type { ServeOptions } from '../types/options';

import { getRandomUUID } from '@ez4/utils';

import { createHash } from 'node:crypto';

import { toRed } from '../utils/format';
import { Logger } from '../utils/logger';
import { WebSocketUtils, WebSocketOpcode } from '../utils/websocket';
import { getIncomingService } from './incoming';

const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

export const upgradeHandler = async (
  request: IncomingMessage,
  socket: Stream.Duplex,
  emulators: ServiceEmulators,
  options: ServeOptions
) => {
  const service = getIncomingService(emulators, request, options);

  Logger.log(`➡️  ${request.method} ${request.url}`);

  if (!service?.emulator) {
    return sendErrorResponse(socket, request, 404, 'Service emulator not found.');
  }

  const { connectHandler, disconnectHandler, messageHandler, ...emulator } = service.emulator;

  if (!connectHandler || !disconnectHandler || !messageHandler) {
    return sendErrorResponse(socket, request, 400, `Service ${emulator.name} can't handle connections.`);
  }

  const { headers, query } = service.request;

  const keyHeader = headers['sec-websocket-key'];

  if (!keyHeader) {
    return sendErrorResponse(socket, request, 500, `Missing WebSocket headers`);
  }

  const acceptKey = createHash('sha1').update(`${keyHeader}${WEBSOCKET_GUID}`).digest('base64');

  sendSuccessResponse(socket, request, 101, acceptKey);

  const connectionId = getRandomUUID();

  const connection = new (class {
    get id() {
      return connectionId;
    }

    get live() {
      return !socket.destroyed && !socket.closed;
    }

    write(data: Buffer | string) {
      writeMessage(socket, data);
    }

    close() {
      socket.destroy();

      return disconnectHandler?.({
        connection: this,
        headers
      });
    }
  })();

  try {
    Logger.log(`🟩 WS connection open [${emulator.name}]`);

    await connectHandler?.({
      connection,
      headers,
      query
    });
  } catch {
    socket.destroy();
    return false;
  }

  let buffer = Buffer.alloc(0);

  socket.on('data', async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    decode: while (buffer.length >= 2) {
      const opcode = WebSocketUtils.decodeOpcode(buffer);

      switch (opcode) {
        case WebSocketOpcode.Close: {
          socket.write(WebSocketUtils.encodeCloseFrame());
          socket.end();

          break decode;
        }

        case WebSocketOpcode.Text: {
          const frame = WebSocketUtils.decodeDataFrame(buffer, 1);

          if (frame) {
            buffer = buffer.subarray(frame.length);

            const response = await messageHandler?.({
              body: frame.data,
              connection
            });

            if (response) {
              connection.write(response);
            }
          }

          break decode;
        }
      }
    }
  });

  socket.on('end', async () => {
    try {
      Logger.log(`🟥 WS connection closed [${emulator.name}]`);

      await connection.close();
    } catch {}
  });
};

const sendSuccessResponse = (socket: Stream.Duplex, request: IncomingMessage, status: number, acceptKey: string) => {
  Logger.log(`⬅️  ${status} ${request.url ?? '/'}`);

  const response = [
    `HTTP/1.1 ${status} Switching Protocols`,
    `Sec-WebSocket-Accept: ${acceptKey}`,
    'Connection: Upgrade',
    'Upgrade: websocket',
    '',
    ''
  ];

  socket.write(response.join('\r\n'));
};

const sendErrorResponse = (socket: Stream.Duplex, request: IncomingMessage, status: number, message: string) => {
  Logger.log(toRed(`⬅️  ${status} ${request.url ?? '/'}`));

  const body = JSON.stringify({
    type: 'error',
    message
  });

  const response = [
    `HTTP/1.1 ${status} Error`,
    'Content-Type: application/json',
    `Content-Length: ${Buffer.byteLength(body).toString()}`,
    'Connection: close',
    '',
    body
  ];

  socket.write(response.join('\r\n'));
  socket.destroy();
};

const writeMessage = (socket: Stream.Duplex, message: Buffer | string) => {
  const content = Buffer.isBuffer(message) ? message : Buffer.from(message);
  const payload = WebSocketUtils.encodeTextFrame(content);

  socket.write(payload);
};
