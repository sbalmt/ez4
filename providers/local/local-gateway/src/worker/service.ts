import type { HttpClient, Http, Ws, WsClient } from '@ez4/gateway';
import type { ProviderContext } from '@ez4/emulator';
import type { HttpServiceClientOptions, WsServiceClientOptions } from '@ez4/local-gateway/client';

import { createHttpServiceClient, createWsServiceClient } from '@ez4/local-gateway/client';
import { ProviderEvent } from '../types/events';

export type HttpServiceOptions = HttpServiceClientOptions & {
  name: string;
};

export type WsServiceOptions = WsServiceClientOptions & {
  name: string;
};

export const makeService = <T extends Http.Service>(options: HttpServiceOptions) => {
  const { name, ...clientOptions } = options;

  return (): HttpClient<T> => {
    return createHttpServiceClient(name, clientOptions);
  };
};

export const makeWsService = <T extends Ws.JsonBody>(options: WsServiceOptions, context: ProviderContext) => {
  const { name, ...clientOptions } = options;

  return (): WsClient<T> => {
    return createWsServiceClient(name, clientOptions, {
      sendMessage: (connectionId, payload) => {
        context.notify(ProviderEvent.SendMessage, {
          connectionId,
          payload
        });
      },
      disconnect: (connectionId) => {
        context.notify(ProviderEvent.Disconnect, {
          connectionId
        });
      }
    });
  };
};
