import type { IncomingMessage } from 'node:http';

import { createHash } from 'node:crypto';

import { isAnyString, isBase64 } from '@ez4/utils';

const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const WEBSOCKET_VERSION = '13';

export const isWsUpgrade = (request: IncomingMessage) => {
  const { method, headers } = request;
  const { upgrade, connection } = headers;

  const hasUpgrade = upgrade?.toLowerCase() === 'websocket';
  const hasConnection = connection?.split(',').some((mode) => mode.toLowerCase().trim() === 'upgrade') ?? false;
  const hasMethod = method === 'GET';

  return hasUpgrade && hasConnection && hasMethod;
};

export const isWsVersion = (value: unknown) => {
  return value === WEBSOCKET_VERSION;
};

export const isWsKey = (value: unknown): value is string => {
  return isAnyString(value) && isBase64(value) && Buffer.from(value, 'base64').length === 16;
};

export const getWsAccept = (key: string) => {
  return createHash('sha1').update(`${key}${WEBSOCKET_GUID}`).digest('base64');
};
