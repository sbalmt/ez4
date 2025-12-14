import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServiceEmulators } from '../emulator/service';
import type { EmulatorResponse } from '../emulator/types';
import type { ServeOptions } from '../types/options';

import { toRed } from '../utils/format';
import { Logger } from '../utils/logger';
import { getIncomingService } from './incoming';

export const requestHandler = (request: IncomingMessage, stream: ServerResponse, emulators: ServiceEmulators, options: ServeOptions) => {
  const service = getIncomingService(emulators, request, options);

  Logger.log(`➡️  ${request.method} ${request.url}`);

  if (!service?.emulator) {
    return sendErrorResponse(stream, request, 404, 'Service emulator not found.');
  }

  if (request.method === 'OPTIONS') {
    return sendSuccessResponse(stream, request, { status: 204 });
  }

  const { requestHandler, ...emulator } = service.emulator;

  if (!requestHandler) {
    return sendErrorResponse(stream, request, 422, `Service ${emulator.name} can't handle requests.`);
  }

  const buffer: Buffer[] = [];

  request.on('data', (chunk) => {
    buffer.push(chunk);
  });

  request.on('end', async () => {
    try {
      const payload = buffer.length ? Buffer.concat(buffer) : undefined;

      const response = await requestHandler({
        ...service.request,
        method: request.method ?? 'GET',
        body: payload
      });

      if (!response) {
        sendSuccessResponse(stream, request, { status: 204 });
      } else {
        sendSuccessResponse(stream, request, response);
      }
    } catch (error) {
      Logger.error(`${emulator.type} [${emulator.name}] ${error}`);

      if (error instanceof Error) {
        sendErrorResponse(stream, request, 500, error.message);
      } else {
        sendErrorResponse(stream, request, 500, `${error}`);
      }
    }
  });
};

const sendSuccessResponse = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, response: EmulatorResponse) => {
  Logger.log(`⬅️  ${response.status} ${request.url ?? '/'}`);

  if (request.headers.origin) {
    setCorsHeaders(stream, request);
  }

  writeResponse(stream, response);
};

const sendErrorResponse = (stream: ServerResponse<IncomingMessage>, request: IncomingMessage, status: number, message: string) => {
  Logger.log(toRed(`⬅️  ${status} ${request.url ?? '/'}`));

  writeResponse(stream, {
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

const writeResponse = (stream: ServerResponse<IncomingMessage>, response: EmulatorResponse) => {
  const { status, headers, body } = response;

  stream.writeHead(status, {
    ...headers,
    ...(body && {
      ['Content-Length']: Buffer.byteLength(body).toString()
    })
  });

  if (body) {
    stream.write(body);
  }

  stream.end();
};
