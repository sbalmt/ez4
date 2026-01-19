import type { Ws, WsClient } from '@ez4/gateway';

import { Logger } from '@ez4/logger';

export const createWsClientMock = <T extends Ws.JsonBody>(serviceName: string): WsClient<T> => {
  return new (class {
    sendMessage<T extends Ws.JsonBody>(_connectionId: string, _message: T) {
      Logger.debug(`✉️  Sending message to connection [${serviceName}]`);
      return Promise.resolve();
    }

    disconnect(_connectionId: string) {
      Logger.debug(`🟥 Closing connection [${serviceName}]`);
      return Promise.resolve();
    }
  })();
};
