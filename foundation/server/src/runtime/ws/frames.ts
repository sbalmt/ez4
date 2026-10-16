import type { Duplex } from 'node:stream';
import type { WsProviderClient } from '../../types/provider';

import { logError } from '../../utils/logger';
import { decodeWsFrame, encodeWsPongFrame } from '../../utils/ws/frame';
import { WebSocketOpcode } from '../../types/ws';
import { notifyWsMessage } from '../provider';
import { replyWsClose } from './response';

export const consumeWsFrames = async (stream: Duplex, head: Buffer, provider: string, client: WsProviderClient) => {
  let buffer: Buffer = Buffer.alloc(0);

  const consume = async (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 2) {
      const frame = decodeWsFrame(buffer);

      if (!frame) {
        break;
      }

      buffer = buffer.subarray(frame.length);

      switch (frame.opcode) {
        default:
          throw new Error('Unsupported WebSocket continuation frame.');

        case WebSocketOpcode.Text:
        case WebSocketOpcode.Binary: {
          const response = await notifyWsMessage(provider, {
            body: frame.payload,
            client
          });

          if (response && client.live) {
            client.write(response);
          }

          break;
        }

        case WebSocketOpcode.Close: {
          replyWsClose(stream);
          return false;
        }

        case WebSocketOpcode.Ping: {
          stream.write(encodeWsPongFrame(frame.payload));
          break;
        }

        case WebSocketOpcode.Pong: {
          break;
        }
      }
    }

    return true;
  };

  try {
    if (head.length && !(await consume(head))) {
      return;
    }

    for await (const chunk of stream.iterator({ destroyOnReturn: false })) {
      if (!(await consume(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))) {
        return;
      }
    }

    stream.end();
  } catch (error) {
    logError(provider, error);
    stream.destroy();
  } finally {
    stream.resume();
  }
};
