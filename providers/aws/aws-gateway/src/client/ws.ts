import type { WsDataSchema, WsPreferences } from '@ez4/gateway/library';
import type { WsClient as WsClientType, Ws } from '@ez4/gateway';

import type {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  DeleteConnectionCommand,
  GoneException
} from '@aws-sdk/client-apigatewaymanagementapi';

import { resolveResponseBody } from '@ez4/gateway/utils';

type WsCache = {
  wsClient: ApiGatewayManagementApiClient;
  PostToConnectionCommand: typeof PostToConnectionCommand;
  DeleteConnectionCommand: typeof DeleteConnectionCommand;
  GoneException: typeof GoneException;
};

let WS_CACHE: Record<string, Promise<WsCache> | undefined> = {};

export namespace WsClient {
  export type Options = {
    preferences?: WsPreferences;
    messageSchema: WsDataSchema;
    path: string;
  };

  export const make = <T extends Ws.JsonBody>(gatewayUrl: string, options: Options): WsClientType<T> => {
    const { preferences, messageSchema, path } = options;

    const endpoint = `https://${new URL(gatewayUrl).hostname}/${path}`;

    return new (class {
      async sendMessage(connectionId: string, message: T) {
        const [content, { wsClient, PostToConnectionCommand }] = await Promise.all([
          resolveResponseBody(message, messageSchema, preferences),
          getWsClient(endpoint)
        ]);

        const payload = JSON.stringify(content);

        await wsClient.send(
          new PostToConnectionCommand({
            Data: Buffer.from(payload),
            ConnectionId: connectionId
          })
        );
      }

      async disconnect(connectionId: string) {
        const { wsClient, DeleteConnectionCommand, GoneException } = await getWsClient(endpoint);

        try {
          await wsClient.send(
            new DeleteConnectionCommand({
              ConnectionId: connectionId
            })
          );
        } catch (error) {
          if (!(error instanceof GoneException)) {
            throw error;
          }
        }
      }
    })();
  };
}

const getWsClient = async (endpoint: string) => {
  if (!WS_CACHE[endpoint]) {
    WS_CACHE[endpoint] = import('@aws-sdk/client-apigatewaymanagementapi')
      .then(({ ApiGatewayManagementApiClient, PostToConnectionCommand, DeleteConnectionCommand, GoneException }) => {
        return {
          wsClient: new ApiGatewayManagementApiClient({ endpoint }),
          PostToConnectionCommand,
          DeleteConnectionCommand,
          GoneException
        };
      })
      .catch((error) => {
        WS_CACHE[endpoint] = undefined;
        throw error;
      });
  }

  return WS_CACHE[endpoint];
};
