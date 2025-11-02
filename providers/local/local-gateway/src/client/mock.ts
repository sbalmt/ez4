import type { Client, ClientRequest, ClientResponse, Http } from '@ez4/gateway';

import { Logger } from '@ez4/project/library';

export const createMockClient = <T extends Http.Service>(serviceName: string, mockResponse?: ClientResponse): Client<T> => {
  return new Proxy(
    {},
    {
      get: () => {
        return (_request: ClientRequest): Promise<ClientResponse> => {
          Logger.debug(`🌐 Sending request to gateway [${serviceName}]`);

          const response = mockResponse ?? { status: 200, body: {} };

          return Promise.resolve(response);
        };
      }
    }
  );
};
