import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServerOptions } from '../types/server';

import { canSendReply } from '../utils/http/response';
import { getIncomingRequest } from '../utils/incoming';
import { logRequest, logError } from '../utils/logger';
import { ProviderType } from '../types/provider';
import { replyHttpFailure, replyHttpSuccess } from './http/response';
import { notifyHttpRequest, providerRegistered } from './provider';

export const requestHandler = (request: IncomingMessage, stream: ServerResponse<IncomingMessage>, options: ServerOptions) => {
  logRequest(request.method, request.url);

  const incoming = getIncomingRequest(request, options);

  const buffer: Buffer[] = [];

  const rejectRequest = (status: number, message: string) => {
    if (canSendReply(stream)) {
      replyHttpFailure(stream, request, status, message);
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

      const response = await notifyHttpRequest(incoming.provider, {
        ...incoming.request,
        method: request.method ?? 'GET',
        body: payload
      });

      if (canSendReply(stream)) {
        if (!response) {
          replyHttpSuccess(stream, request, { status: 204 });
        } else {
          replyHttpSuccess(stream, request, response);
        }
      }
    } catch (error) {
      requestError(error);
    }
  });
};
