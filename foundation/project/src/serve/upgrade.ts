import type { IncomingMessage } from 'node:http';
import type { Stream } from 'node:stream';
import type { ServiceEmulators } from '../emulator/service';
import type { ServeOptions } from '../types/options';

import { Logger, LogFormat, LogColor } from '@ez4/logger';
import { getRandomUUID } from '@ez4/utils';

import { createHash } from 'node:crypto';

import { WebSocketFrame, WebSocketOpcode } from '../utils/websocket';
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
      const content = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const payload = WebSocketFrame.encodeTextFrame(content);

      socket.write(payload);
    }

    close() {
      try {
        socket.destroy();

        return disconnectHandler?.({
          connection: this,
          headers
        });
      } catch (error) {
        Logger.error(`${emulator.type} [${emulator.name}] ${error}`);
      }
    }
  })();

  try {
    Logger.log(`🟩 WS connection open [${emulator.name}]`);

    await connectHandler?.({
      connection,
      headers,
      query
    });
  } catch (error) {
    Logger.error(`${emulator.type} [${emulator.name}] ${error}`);
    socket.destroy();
    return;
  }

  let buffer = Buffer.alloc(0);

  socket.on('data', async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 2) {
      const frame = WebSocketFrame.decodeFrame(buffer);

      if (!frame) {
        break;
      }

      buffer = buffer.subarray(frame.length);

      switch (frame.opcode) {
        default: {
          socket.destroy();
          break;
        }

        case WebSocketOpcode.Text:
        case WebSocketOpcode.Binary: {
          try {
            Logger.log(`➡️  ${emulator.type} [${emulator.name}] Incoming message`);

            const response = await messageHandler?.({
              body: frame.payload,
              connection
            });

            if (response) {
              connection.write(response);
            }
          } catch (error) {
            Logger.error(`${emulator.type} [${emulator.name}] ${error}`);
            socket.destroy();
          }

          break;
        }

        case WebSocketOpcode.Close: {
          socket.write(WebSocketFrame.encodeCloseFrame());
          socket.end();
          break;
        }

        case WebSocketOpcode.Ping: {
          socket.write(WebSocketFrame.encodePongFrame(frame.payload));
          break;
        }

        case WebSocketOpcode.Pong: {
          // Do nothing.
          break;
        }
      }
    }
  });

  socket.on('end', async () => {
    Logger.log(`🟥 WS connection closed [${emulator.name}]`);
    await connection.close();
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
  Logger.log(LogFormat.toColor(LogColor.Red, `⬅️  ${status} ${request.url ?? '/'}`));

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
