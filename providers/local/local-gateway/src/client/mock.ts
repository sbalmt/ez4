import type { Client, ClientRequest, ClientResponse, Http } from '@ez4/gateway';

import { Logger } from '@ez4/project/library';
import { isAnyString } from '@ez4/utils';

export type ClientMockResponses = {
  operations?: Record<string, unknown>;
  default: ClientResponse;
};

export const createClientMock = <T extends Http.Service>(serviceName: string, responses: ClientMockResponses): Client<T> => {
  return new Proxy(
    {},
    {
      get: (_target, property) => {
        return (_request: ClientRequest) => {
          if (!isAnyString(property)) {
            throw new Error(`Operation '${property.toString()}' wasn't found.`);
          }

          Logger.debug(`🌐 Sending request to gateway [${serviceName}]`);

          const response = responses.operations?.[property] ?? responses.default;

          return Promise.resolve(response);
        };
      }
    }
  );
};
