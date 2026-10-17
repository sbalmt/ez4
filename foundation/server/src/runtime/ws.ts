import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import type { ServerOptions } from '../types/server';

import { ProviderType } from '../types/provider';
import { isStreamLive } from '../utils/ws/stream';
import { getHttpErrorStatus } from '../utils/http/errors';
import { isWsKey, isWsUpgrade, isWsVersion } from '../utils/ws/handshake';
import { logRequest, logError } from '../utils/logger';
import { getIncomingRequest } from '../utils/incoming';
import { replyWsError, replyWsSuccess } from './ws/response';
import { createWsConnection } from './ws/connection';
import { consumeWsFrames } from './ws/frames';
import { notifyWsConnect, providerRegistered } from './provider';

export const upgradeHandler = async (request: IncomingMessage, stream: Duplex, head: Buffer, options: ServerOptions) => {
  logRequest(request.method, request.url);

  const incoming = getIncomingRequest(request, options);

  if (!isWsUpgrade(request)) {
    return replyWsError(stream, request, 400, 'Expected a WebSocket Upgrade request.');
  }

  if (!isWsVersion(request.headers['sec-websocket-version'])) {
    return replyWsError(stream, request, 400, 'Unsupported WebSocket version.');
  }

  const headerKey = request.headers['sec-websocket-key'];

  if (!isWsKey(headerKey)) {
    return replyWsError(stream, request, 400, 'Invalid WebSocket key.');
  }

  if (!incoming || !providerRegistered(incoming.provider)) {
    return replyWsError(stream, request, 404, 'Service emulator not found.');
  }

  if (!providerRegistered(incoming.provider, ProviderType.Ws)) {
    return replyWsError(stream, request, 422, 'Provider cannot handle WebSocket connections.');
  }

  const { provider, request: incomingRequest } = incoming;
  const { headers, query } = incomingRequest;

  const { id, establish } = createWsConnection(stream, provider, headers);

  try {
    await notifyWsConnect(provider, {
      id,
      headers,
      query
    });

    if (isStreamLive(stream)) {
      replyWsSuccess(stream, request, headerKey);

      const client = establish();

      await consumeWsFrames(stream, head, provider, client);
    }
  } catch (error) {
    logError(provider, error);

    const status = getHttpErrorStatus(error);

    return replyWsError(stream, request, status, `${error}`);
  }
};
