import { HttpError, HttpInternalServerError, type Client, type ClientRequest, type ClientResponse, type Http } from '@ez4/gateway';

import { Logger } from '@ez4/project/library';
import { getHttpException } from '@ez4/gateway/utils';
import { isAnyString } from '@ez4/utils';

export type ClientMockOperation = (request: ClientRequest) => Promise<ClientResponse>;

export type ClientMockResponses = {
  operations?: Record<string, ClientMockOperation | unknown>;
  default: ClientMockOperation | ClientResponse;
};

export const createClientMock = <T extends Http.Service>(serviceName: string, responses: ClientMockResponses): Client<T> => {
  return new Proxy(
    {},
    {
      get: (_target, property) => {
        return async (request: ClientRequest) => {
          if (!isAnyString(property)) {
            throw new Error(`Operation '${property.toString()}' wasn't found.`);
          }

          Logger.debug(`🌐 Sending request to gateway [${serviceName}]`);

          const operation = responses.operations?.[property] ?? responses.default;

          try {
            const response = operation instanceof Function ? await operation(request) : operation;

            const { status, headers, body } = response;

            if (status < 200 || status > 299) {
              throw getHttpException(status, body.message, body.details);
            }

            return {
              status,
              headers,
              body
            };

            //
          } catch (error) {
            if (!(error instanceof HttpError)) {
              throw new HttpInternalServerError();
            }

            throw error;
          }
        };
      }
    }
  );
};
