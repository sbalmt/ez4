import type { EmulatorConnection } from '@ez4/project/library';
import type { Ws, WsClient } from '@ez4/gateway';

import { Logger } from '@ez4/project/library';

export type WsServiceClientOptions = {
  connections: Record<string, EmulatorConnection>;
};

export const createWsServiceClient = (serviceName: string, options: WsServiceClientOptions): WsClient => {
  const { connections } = options;

  return new (class {
    sendMessage<T extends Ws.JsonBody>(connectionId: string, message: T) {
      const connection = connections[connectionId];

      if (!connection) {
        throw new Error('Connection not found.');
      }

      Logger.debug(`✉️  Sending message to connection [${serviceName}]`);

      connection.write(Buffer.from(JSON.stringify(message)));

      return Promise.resolve();
    }

    disconnect(connectionId: string) {
      const connection = connections[connectionId];

      Logger.debug(`🟥 Closing connection [${serviceName}]`);

      if (connection) {
        connection.close();
      }

      return Promise.resolve();
    }
  })();
};
