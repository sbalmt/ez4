import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpProviderCors, HttpProviderResponse } from '../../types/provider';

import { getHttpCorsPreflightHeaders, getHttpCorsResponseHeaders } from '../../utils/http/cors';
import { isHttpOptionsMethod } from '../../utils/http/method';
import { logFailure, logSuccess } from '../../utils/logger';

export const replyHttpSuccess = (
  stream: ServerResponse<IncomingMessage>,
  request: IncomingMessage,
  cors: HttpProviderCors | undefined,
  response: HttpProviderResponse
) => {
  const { url, method } = request;

  if (isHttpOptionsMethod(method) && cors) {
    logSuccess(204, url);

    return writeResponse(stream, {
      headers: getHttpCorsPreflightHeaders(request, cors),
      status: 204
    });
  }

  const { status, headers } = response;

  logSuccess(status, url);

  if (cors) {
    return writeResponse(stream, {
      ...response,
      headers: getHttpCorsResponseHeaders(request, cors, headers)
    });
  }

  return writeResponse(stream, response);
};

export const replyHttpFailure = (
  stream: ServerResponse<IncomingMessage>,
  request: IncomingMessage,
  cors: HttpProviderCors | undefined,
  status: number,
  message: string
) => {
  logFailure(status, request.url);

  const response: HttpProviderResponse = {
    status,
    headers: getHttpCorsResponseHeaders(request, cors, {
      ['Content-Type']: 'application/json'
    }),
    body: JSON.stringify({
      type: 'error',
      message
    })
  };

  writeResponse(stream, response);
};

const writeResponse = (stream: ServerResponse<IncomingMessage>, response: HttpProviderResponse) => {
  const { status, headers, body } = response;

  for (const [name, value] of Object.entries(headers ?? {})) {
    stream.setHeader(name, value);
  }

  if (body) {
    stream.setHeader('Content-Length', Buffer.byteLength(body).toString());
  }

  stream.writeHead(status);

  if (body) {
    stream.write(body);
  }

  stream.end();
};
