import type { WsClient as WsClientType, Ws } from '@ez4/gateway';

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  DeleteConnectionCommand,
  GoneException
} from '@aws-sdk/client-apigatewaymanagementapi';

export namespace WsClient {
  export const make = (gatewayUrl: string): WsClientType => {
    const client = new ApiGatewayManagementApiClient({
      endpoint: `https://${new URL(gatewayUrl).hostname}/stream`
    });

    return new (class {
      async sendMessage<T extends Ws.JsonBody>(connectionId: string, message: T) {
        await client.send(
          new PostToConnectionCommand({
            Data: Buffer.from(JSON.stringify(message)),
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
