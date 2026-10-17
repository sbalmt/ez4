import type { Duplex } from 'node:stream';
import type { WsProviderClient } from '../../types/provider';
import type { WsFrame } from '../../types/ws';

import { logError } from '../../utils/logger';
import { decodeWsFrame, encodeWsPongFrame } from '../../utils/ws/frame';
import { WsUnexpectedFrameError, WsCloseError } from '../../errors/ws';
import { WsOpcode } from '../../types/ws';
import { notifyWsMessage } from '../provider';
import { replyWsClose } from './response';

export const consumeWsFrames = async (stream: Duplex, head: Buffer, provider: string, client: WsProviderClient) => {
  let buffer: Buffer = Buffer.alloc(0);

  let fragments: Buffer[] = [];

  const collect = (frame: WsFrame) => {
    if (frame.opcode === WsOpcode.Continue && !fragments.length) {
      throw new WsUnexpectedFrameError('Unexpected WebSocket continuation frame.');
    }

    if (frame.opcode !== WsOpcode.Continue && fragments.length) {
      throw new WsUnexpectedFrameError('Expected a WebSocket continuation frame.');
    }

    fragments.push(frame.payload);

    if (frame.fin) {
      const message = Buffer.concat(fragments);

      fragments = [];

      return message;
    }

    return undefined;
  };

  const consume = async (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 2) {
      const frame = decodeWsFrame(buffer);

      if (!frame) {
        break;
      }

      buffer = buffer.subarray(frame.length);

      switch (frame.opcode) {
        case WsOpcode.Text:
        case WsOpcode.Binary:
        case WsOpcode.Continue: {
          const message = collect(frame);

          if (message) {
            const response = await notifyWsMessage(provider, {
              body: message,
              client
            });

            if (response && client.live) {
              client.write(response);
            }
          }

          break;
        }

        case WsOpcode.Close: {
          replyWsClose(stream);
          return false;
        }

        case WsOpcode.Ping: {
          if (!frame.fin) {
            throw new WsUnexpectedFrameError('WebSocket control frames cannot be fragmented.');
          }

          stream.write(encodeWsPongFrame(frame.payload));
          break;
        }

        case WsOpcode.Pong: {
          if (!frame.fin) {
            throw new WsUnexpectedFrameError('WebSocket control frames cannot be fragmented.');
          }

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
    if (error instanceof WsCloseError) {
      replyWsClose(stream, error.code);
      return;
    }

    logError(provider, error);
    stream.destroy();
  } finally {
    stream.resume();
  }
};
