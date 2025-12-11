import type { WsClient } from '@ez4/gateway';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { createWsClientMock } from '../../client/ws/mock';

export namespace WsTester {
  export type ClientMock = WsClient & {
    receiveMessage: Mock<WsClient['sendMessage']>;
    sendMessage: Mock<WsClient['disconnect']>;
  };

  export const getClient = (resourceName: string) => {
    return Tester.getServiceClient(resourceName) as WsClient;
  };

  export const getClientMock = (resourceName: string) => {
    const client = createWsClientMock(resourceName) as ClientMock;

    return client;
  };
}
