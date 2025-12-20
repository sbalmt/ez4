import type { EmulatorConnection } from '@ez4/project/library';
import type { WsPreferences } from '@ez4/gateway/library';
import type { Ws, WsClient } from '@ez4/gateway';
import type { AnySchema } from '@ez4/schema';

import { resolveResponseBody } from '@ez4/gateway/utils';
import { Logger } from '@ez4/project/library';

export type WsServiceClientOptions = {
  preferences?: WsPreferences;
  allConnections: Record<string, EmulatorConnection>;
  messageSchema: AnySchema;
};

export const createWsServiceClient = <T extends Ws.JsonBody = any>(serviceName: string, options: WsServiceClientOptions): WsClient<T> => {
  const { allConnections, messageSchema, preferences } = options;

  return new (class {
    async sendMessage<T extends Ws.JsonBody>(connectionId: string, message: T) {
      const connection = allConnections[connectionId];

      if (!connection) {
        throw new Error('Connection not found.');
      }

      Logger.debug(`✉️  Sending message to connection [${serviceName}]`);

      const content = await resolveResponseBody(message, messageSchema, preferences);
      const payload = JSON.stringify(content);

      connection.write(payload);

      return Promise.resolve();
    }

    disconnect(connectionId: string) {
      const connection = allConnections[connectionId];

      Logger.debug(`🟥 Closing connection [${serviceName}]`);

      if (connection) {
        connection.close();
      }

      return Promise.resolve();
    }
  })();
};
