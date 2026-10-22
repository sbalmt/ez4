import { equal } from 'node:assert/strict';
import { IncomingMessage } from 'node:http';
import { describe, it } from 'node:test';
import { Socket } from 'node:net';

import { getWsAccept, isWsKey, isWsUpgrade, isWsVersion } from '../src/utils/ws/handshake';

describe('WebSocket handshake tests', () => {
  it('assert :: accepts WebSocket version 13', () => {
    equal(isWsVersion('13'), true);
  });

  it('assert :: rejects missing or unsupported WebSocket versions', () => {
    equal(isWsVersion(undefined), false);
    equal(isWsVersion('12'), false);
    equal(isWsVersion(13), false);
    equal(isWsVersion(['13']), false);
  });

  it('assert :: accepts case-insensitive Upgrade headers and connection tokens', () => {
    const request = new IncomingMessage(new Socket());

    request.method = 'GET';

    request.headers = {
      upgrade: 'WebSocket',
      connection: 'keep-alive, Upgrade'
    };

    equal(isWsUpgrade(request), true);
  });

  it('assert :: rejects methods other than GET', () => {
    const request = new IncomingMessage(new Socket());

    request.method = 'POST';

    request.headers = {
      upgrade: 'websocket',
      connection: 'Upgrade'
    };

    equal(isWsUpgrade(request), false);
  });

  it('assert :: rejects missing Upgrade headers', () => {
    const request = new IncomingMessage(new Socket());

    request.method = 'GET';

    equal(isWsUpgrade(request), false);
  });

  it('assert :: rejects an incompatible Upgrade header', () => {
    const request = new IncomingMessage(new Socket());

    request.method = 'GET';

    request.headers = {
      upgrade: 'other',
      connection: 'Upgrade'
    };

    equal(isWsUpgrade(request), false);
  });

  it('assert :: rejects a connection without an Upgrade mode', () => {
    const request = new IncomingMessage(new Socket());

    request.method = 'GET';

    request.headers = {
      upgrade: 'websocket',
      connection: 'keep-alive'
    };

    equal(isWsUpgrade(request), false);
  });

  it('assert :: rejects a missing Connection header', () => {
    const request = new IncomingMessage(new Socket());

    request.method = 'GET';
    request.headers = { upgrade: 'websocket' };

    equal(isWsUpgrade(request), false);
  });

  it('assert :: accepts a base64 key containing 16 bytes', () => {
    equal(isWsKey('dGhlIHNhbXBsZSBub25jZQ=='), true);
  });

  it('assert :: rejects non-string keys', () => {
    equal(isWsKey(undefined), false);
    equal(isWsKey(null), false);
    equal(isWsKey(['dGhlIHNhbXBsZSBub25jZQ==']), false);
  });

  it('assert :: rejects malformed base64 keys', () => {
    equal(isWsKey(''), false);
    equal(isWsKey('!!!!!!!!!!!!!!!!!!!!!!=='), false);
    equal(isWsKey('dGhlIHNhbXBsZSBub25jZQ'), false);
  });

  it('assert :: rejects keys with the wrong decoded length', () => {
    equal(isWsKey(Buffer.alloc(15).toString('base64')), false);
    equal(isWsKey(Buffer.alloc(17).toString('base64')), false);
  });

  it('assert :: computes the standard accept key', () => {
    equal(getWsAccept('dGhlIHNhbXBsZSBub25jZQ=='), 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=');
  });
});
