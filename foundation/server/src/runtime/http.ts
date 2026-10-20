import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HttpProviderCors } from '../types/provider';
import type { ServerOptions } from '../types/server';

import { canSendReply } from '../utils/http/response';
import { isHttpOptionsMethod } from '../utils/http/method';
import { getIncomingRequest } from '../utils/incoming';
import { logRequest, logError } from '../utils/logger';
import { ProviderType } from '../types/provider';
import { replyHttpFailure, replyHttpSuccess } from './http/response';
import { getHttpProviderOptions, notifyHttpRequest, providerRegistered } from './provider';

export const requestHandler = (request: IncomingMessage, stream: ServerResponse<IncomingMessage>, options: ServerOptions) => {
  logRequest(request.method, request.url);

  const incoming = getIncomingRequest(request, options);

  const buffer: Buffer[] = [];

  let cors: HttpProviderCors | undefined;

  const rejectRequest = (status: number, message: string) => {
    if (canSendReply(stream)) {
      replyHttpFailure(stream, request, cors, status, message);
    } else {
      stream.destroy();
    }
  };

  const requestError = (error: unknown, status = 500) => {
    logError(incoming?.provider ?? options.name, error);

    rejectRequest(status, `${error}`);
  };

  if (!incoming || !providerRegistered(incoming.provider)) {
    return rejectRequest(404, 'Service emulator not found.');
  }

  if (!providerRegistered(incoming.provider, ProviderType.Http)) {
    return rejectRequest(422, 'Provider cannot handle HTTP requests.');
  }

  cors = getHttpProviderOptions(incoming.provider)?.cors;

  request.on('data', (chunk) => {
    buffer.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  request.once('error', (error) => {
    requestError(error, 400);
  });

  request.on('end', async () => {
    if (!canSendReply(stream)) {
      return;
    }

    try {
      const payload = buffer.length ? Buffer.concat(buffer) : undefined;

      const { method = 'GET' } = request;

      const useCors = isHttpOptionsMethod(method) && cors;

      const response = useCors
        ? undefined
        : await notifyHttpRequest(incoming.provider, {
            ...incoming.request,
            body: payload,
            method
          });

      if (canSendReply(stream)) {
        replyHttpSuccess(stream, request, cors, response ?? { status: 204 });
      }
    } catch (error) {
      requestError(error);
    }
  });
};
