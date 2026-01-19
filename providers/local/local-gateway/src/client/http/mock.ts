import type { HttpClient, HttpClientRequest, HttpClientResponse, Http } from '@ez4/gateway';

import { mock } from 'node:test';

import { getHttpException } from '@ez4/gateway/utils';
import { HttpError, HttpInternalServerError } from '@ez4/gateway';
import { isAnyString } from '@ez4/utils';
import { Logger } from '@ez4/logger';

export type HttpClientMockOperation = (request: HttpClientRequest) => Promise<HttpClientResponse>;

export type HttpClientMockResponses = {
  operations?: Record<string, HttpClientMockOperation | unknown>;
  default: HttpClientMockOperation | HttpClientResponse;
};

export const createHttpClientMock = <T extends Http.Service>(serviceName: string, responses: HttpClientMockResponses): HttpClient<T> => {
  const operationsCache: Record<string, HttpClientMockOperation | HttpClientResponse> = {};

  return new Proxy(
    {},
    {
      get: (_target, property) => {
        if (!isAnyString(property)) {
          throw new Error(`Operation '${property.toString()}' wasn't found.`);
        }

        if (property === 'then') {
          return undefined;
        }

        if (!operationsCache[property]) {
          const operation = responses.operations?.[property] ?? responses.default;

          operationsCache[property] = mock.fn(async (request: HttpClientRequest) => {
            Logger.debug(`🌐 Sending request to gateway [${serviceName}]`);

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
          });
        }

        return operationsCache[property];
      }
    }
  );
};
