import type { Ws, WsClient } from '@ez4/gateway';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { createWsClientMock } from '../../client/ws/mock';

export namespace WsTester {
  export type ClientMock<T extends Ws.JsonBody> = WsClient<T> & {
    receiveMessage: Mock<WsClient<T>['sendMessage']>;
    sendMessage: Mock<WsClient<T>['disconnect']>;
  };

  export const getClient = <T extends Ws.JsonBody>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as WsClient<T>;
  };

  export const getClientMock = <T extends Ws.JsonBody = any>(resourceName: string) => {
    const client = createWsClientMock(resourceName) as ClientMock<T>;

    return client;
  };
}
