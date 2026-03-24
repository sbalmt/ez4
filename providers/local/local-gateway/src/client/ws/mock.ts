import type { Ws, WsClient } from '@ez4/gateway';

import { Logger } from '@ez4/logger';

export const createWsClientMock = <T extends Ws.JsonBody>(resourceName: string): WsClient<T> => {
  return new (class {
    sendMessage<T extends Ws.JsonBody>(_connectionId: string, _message: T) {
      Logger.log(`✉️  Sending message to connection [${resourceName}]`);
      return Promise.resolve();
    }

    disconnect(_connectionId: string) {
      Logger.log(`🟥 Closing connection [${resourceName}]`);
      return Promise.resolve();
    }
  })();
};
