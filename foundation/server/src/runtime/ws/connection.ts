import type { Duplex } from 'node:stream';
import type { WsProviderClient, WsProviderConnection } from '../../types/provider';

import { getRandomUUID } from '@ez4/utils';

import { isStreamLive } from '../../utils/ws/stream';
import { encodeWsTextFrame } from '../../utils/ws/frame';
import { logConnection, logDisconnection, logError } from '../../utils/logger';
import { UnavailableConnectionError } from '../../errors/client';
import { WsState } from '../../types/ws';
import { notifyWsDisconnect } from '../provider';
import { registerWsClient, unregisterWsClient } from './client';
import { replyWsClose } from './replies';

export const createWsConnection = (stream: Duplex, provider: string, headers: WsProviderConnection['headers']) => {
  let state: WsState = WsState.Pending;

  const id = getRandomUUID();

  const client: WsProviderClient = {
    get id() {
      return id;
    },
    get live() {
      return isStreamLive(stream);
    },
    write(data: string) {
      if (state !== WsState.Connected) {
        throw new UnavailableConnectionError();
      }

      const frame = encodeWsTextFrame(Buffer.from(data));

      stream.write(frame);
    },
    close() {
      replyWsClose(stream);

      return disconnect();
    }
  };

  const disconnect = async () => {
    if (state === WsState.Disconnected) {
      return;
    }

    const established = state === WsState.Connected;

    state = WsState.Disconnected;

    if (established) {
      unregisterWsClient(id);

      logDisconnection(provider);

      await notifyWsDisconnect(provider, {
        headers,
        id
      });
    }
  };

  stream.once('close', () => {
    disconnect().catch((error: unknown) => {
      logError(provider, error);
      stream.destroy();
    });
  });

  stream.on('error', () => {
    stream.destroy();
  });

  return {
    id,
    establish: () => {
      if (state === WsState.Pending) {
        logConnection(provider);

        state = WsState.Connected;

        registerWsClient(client);
      }

      return client;
    }
  };
};
