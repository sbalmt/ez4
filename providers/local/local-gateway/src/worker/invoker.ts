import type {
  AuthRequest,
  HttpErrors,
  HttpPreferences,
  HttpRequest,
  HttpResponse,
  WsEvent,
  WsPreferences,
  WsRequest,
  WsResponse
} from '@ez4/gateway/library';
import type { Http, Ws } from '@ez4/gateway';
import type { ValidationCustomContext } from '@ez4/validator';
import type { ModuleInvocation, ModuleInvoker } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';
import type { IncomingRequest } from '../utils/request';

import { resolveValidation } from '@ez4/gateway/utils';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/runtime';

import { getHttpErrorResponse, getHttpSuccessResponse } from '../utils/http/response';
import { getWsErrorResponse, getWsSuccessResponse } from '../utils/ws/response';

import {
  getIncomingRequestIdentity,
  getIncomingRequestParameters,
  getIncomingRequestHeaders,
  getIncomingRequestQuery,
  getIncomingRequestBody
} from '../utils/request';

export const enum RequestType {
  HttpAuthorizer = 'http:authorizer',
  HttpRequest = 'http:request',
  WsAuthorizer = 'ws:authorizer',
  WsConnection = 'ws:connection',
  WsMessage = 'ws:message'
}

export type InvokerOptions = {
  type: RequestType;
  request?: HttpRequest | AuthRequest | WsRequest | WsEvent;
  preferences?: HttpPreferences | WsPreferences;
  response?: HttpResponse | WsResponse;
  httpErrors?: HttpErrors;
};

export type InvokerIncoming = IncomingRequest & {
  connectionId?: string;
  identity?: AnyObject;
  method?: string;
  path?: string;
  body?: string;
};

export const makeInvoker = (options: InvokerOptions): ModuleInvoker => {
  const { type } = options;

  return async (invocation: ModuleInvocation) => {
    const original = invocation.request as InvokerIncoming;

    const traceId = getRandomUUID();

    Runtime.setScope({
      traceId
    });

    const request: AnyObject = {
      ...getMinimalRequest(type, original),
      requestId: getRandomUUID(),
      timestamp: new Date(),
      traceId
    };

    try {
      await invocation.begin(request);
      await prepareRequest(options, invocation, request);

      await invocation.ready(request);

      const response = await invocation.invoke(request);

      await invocation.done(request);

      switch (type) {
        case RequestType.HttpRequest:
          if (!options.response) {
            throw new Error('Missing HTTP response metadata.');
          }

          return getHttpSuccessResponse(options.response as HttpResponse, response as Http.Response, options.preferences);

        case RequestType.WsMessage:
          return options.response && response
            ? getWsSuccessResponse(options.response, response as Ws.Response, options.preferences)
            : undefined;

        default:
          return response;
      }
    } catch (error) {
      await invocation.error(error, request);

      if (error instanceof Error) {
        switch (type) {
          case RequestType.HttpRequest:
          case RequestType.HttpAuthorizer:
            return getHttpErrorResponse(error, options.httpErrors);

          case RequestType.WsMessage:
            return getWsErrorResponse(error);
        }
      }

      throw error;
    } finally {
      await invocation.end(request);
    }
  };
};

const prepareRequest = async (options: InvokerOptions, invocation: ModuleInvocation, request: AnyObject) => {
  const { type, request: metadata, preferences } = options;

  if (!metadata) {
    return;
  }

  const original = invocation.request as InvokerIncoming;

  const onCustomValidation = (value: unknown, { type }: ValidationCustomContext) => {
    return resolveValidation(value, invocation.context, type);
  };

  const incoming = { ...original, preferences };

  switch (type) {
    case RequestType.HttpAuthorizer:
      Object.assign(request, await getIncomingRequestHeaders(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestParameters(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(metadata, incoming, onCustomValidation));
      break;

    case RequestType.HttpRequest:
      Object.assign(request, await getIncomingRequestIdentity(metadata, original.identity, onCustomValidation));
      Object.assign(request, await getIncomingRequestHeaders(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestParameters(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestBody(metadata, incoming, onCustomValidation));
      break;

    case RequestType.WsAuthorizer:
      Object.assign(request, await getIncomingRequestHeaders(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(metadata, incoming, onCustomValidation));
      break;

    case RequestType.WsConnection:
      Object.assign(request, await getIncomingRequestIdentity(metadata, original.identity, onCustomValidation));
      Object.assign(request, await getIncomingRequestHeaders(metadata, incoming, onCustomValidation));
      Object.assign(request, await getIncomingRequestQuery(metadata, incoming, onCustomValidation));
      break;

    case RequestType.WsMessage:
      Object.assign(request, await getIncomingRequestIdentity(metadata, original.identity, onCustomValidation));
      Object.assign(request, await getIncomingRequestBody(metadata, incoming, onCustomValidation));
      break;
  }
};

const getMinimalRequest = (type: RequestType, original: InvokerIncoming) => {
  switch (type) {
    case RequestType.HttpAuthorizer:
      return {
        method: original.method,
        path: original.path
      };

    case RequestType.HttpRequest:
      return {
        method: original.method,
        path: original.path,
        data: original.body,
        encoded: false
      };

    default:
      return {
        connectionId: original.connectionId
      };
  }
};
