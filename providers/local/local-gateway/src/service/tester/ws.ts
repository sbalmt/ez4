import type { Ws, WsClient } from '@ez4/gateway';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createWsClientMock } from '../../client/ws/mock';

export namespace WsTester {
  export type ClientMock<T extends Ws.JsonBody> = WsClient<T> & {
    sendMessage: Mock<WsClient<T>['sendMessage']>;
    disconnect: Mock<WsClient<T>['disconnect']>;
  };

  export const getClient = <T extends Ws.JsonBody>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as WsClient<T>;
  };

  export const getClientMock = <T extends Ws.JsonBody = any>(resourceName: string) => {
    const client = createWsClientMock(resourceName) as ClientMock<T>;

    mock.method(client, 'sendMessage');
    mock.method(client, 'disconnect');

    return client;
  };
}
