import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpProviderResponse } from '../../types/provider';

import { arrayUnique } from '@ez4/utils';

import { hasVaryHeader } from '../../utils/http/response';
import { logFailure, logSuccess } from '../../utils/logger';

export const replyHttpSuccess = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, response: HttpProviderResponse) => {
  logSuccess(response.status, request.url);

  writeResponse(stream, request, response);
};

export const replyHttpFailure = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, status: number, message: string) => {
  logFailure(status, request.url);

  writeResponse(stream, request, {
    status,
    headers: {
      ['Content-Type']: 'application/json'
    },
    body: JSON.stringify({
      type: 'error',
      message
    })
  });
};

const setCorsHeaders = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage) => {
  const responseOrigin = request.headers.origin;

  if (responseOrigin) {
    stream.setHeader('Access-Control-Allow-Origin', responseOrigin);
    stream.setHeader('Access-Control-Allow-Credentials', 'true');

    if (request.method !== 'OPTIONS') {
      return;
    }

    const responseMethod = request.headers['access-control-request-method'] ?? request.method;
    const responseHeaders = request.headers['access-control-request-headers'];

    if (responseHeaders) {
      stream.setHeader('Access-Control-Allow-Headers', responseHeaders);
    }

    stream.setHeader('Access-Control-Allow-Methods', responseMethod);
  }
};

const writeResponse = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, response: HttpProviderResponse) => {
  const { status, headers, body } = response;

  setCorsHeaders(stream, request);

  for (const [name, value] of Object.entries(headers ?? {})) {
    stream.setHeader(name, value);
  }

  if (request.headers.origin) {
    const header = stream.getHeader('Vary')?.toString();
    const values = arrayUnique(header?.split(',').map((token) => token.trim()));

    if (!hasVaryHeader(values, 'Origin')) {
      stream.setHeader('Vary', [...values, 'Origin'].join(', '));
    }
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
