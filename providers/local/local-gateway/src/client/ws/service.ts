import type { EmulatorConnection } from '@ez4/project/library';
import type { WsPreferences } from '@ez4/gateway/library';
import type { Ws, WsClient } from '@ez4/gateway';
import type { AnySchema } from '@ez4/schema';

import { resolveResponseBody } from '@ez4/gateway/utils';
import { Logger } from '@ez4/logger';

export type WsServiceClientOptions = {
  preferences?: WsPreferences;
  messageSchema: AnySchema;
};

export type WsServiceConnections = {
  sendMessage: (connectionId: string, payload: string) => void;
  disconnect: (connectionId: string) => void;
};

export const createWsServiceClient = <T extends Ws.JsonBody = any>(
  resourceName: string,
  options: WsServiceClientOptions,
  connections: WsServiceConnections
): WsClient<T> => {
  const { messageSchema, preferences } = options;

  return new (class {
    async sendMessage<T extends Ws.JsonBody>(connectionId: string, message: T) {
      Logger.log(`✉️  Sending message to connection [${resourceName}]`);

      const content = await resolveResponseBody(message, messageSchema, preferences);
      const payload = JSON.stringify(content);

      connections.sendMessage(connectionId, payload);
    }

    disconnect(connectionId: string) {
      Logger.log(`🟥 Closing connection [${resourceName}]`);

      connections.disconnect(connectionId);

      return Promise.resolve();
    }
  })();
};

export const createLocalConnections = (allConnections: Record<string, EmulatorConnection>): WsServiceConnections => {
  return {
    sendMessage: (connectionId, payload) => {
      const connection = allConnections[connectionId];

      if (!connection) {
        throw new Error('Connection not found.');
      }

      connection.write(payload);
    },
    disconnect: (connectionId) => {
      allConnections[connectionId]?.close();
    }
  };
};
