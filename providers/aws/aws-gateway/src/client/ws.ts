import type { WsDataSchema, WsPreferences } from '@ez4/gateway/library';
import type { WsClient as WsClientType, Ws } from '@ez4/gateway';

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  DeleteConnectionCommand,
  GoneException
} from '@aws-sdk/client-apigatewaymanagementapi';

import { getResponseBody } from '@ez4/gateway/utils';

export namespace WsClient {
  export type Options = {
    preferences?: WsPreferences;
    messageSchema: WsDataSchema;
    path: string;
  };

  export const make = <T extends Ws.JsonBody>(gatewayUrl: string, options: Options): WsClientType<T> => {
    const { preferences, messageSchema, path } = options;

    const client = new ApiGatewayManagementApiClient({
      endpoint: `https://${new URL(gatewayUrl).hostname}/${path}`
    });

    return new (class {
      async sendMessage(connectionId: string, message: T) {
        const content = await getResponseBody(message, messageSchema, preferences);
        const payload = JSON.stringify(content);

        await client.send(
          new PostToConnectionCommand({
            Data: Buffer.from(payload),
            ConnectionId: connectionId
          })
        );
      }

      async disconnect(connectionId: string) {
        try {
          await client.send(
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
