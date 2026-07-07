import { equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { base64Decode, base64Encode, isBase64 } from '@ez4/utils';

describe('base64 utils', () => {
  const OriginalBuffer = global.Buffer;

  const noBuffer = (callback: () => string) => {
    // @ts-ignore Emulate browser without Buffer.
    global.Buffer = undefined;

    const result = callback();

    global.Buffer = OriginalBuffer;

    return result;
  };

  it('assert :: valid base64', () => {
    ok(isBase64('ade1'));
    ok(isBase64('ad2='));
    ok(isBase64('ad=='));
  });

  it('assert :: invalid base64', () => {
    ok(!isBase64('@a=='));
    ok(!isBase64('a1d'));
    ok(!isBase64('a2='));
  });

  it('assert :: base64 encode', () => {
    equal(base64Encode('hello world'), 'aGVsbG8gd29ybGQ=');
  });

  it('assert :: base64 decode', () => {
    equal(base64Decode('aGVsbG8gd29ybGQ='), 'hello world');
  });

  it('assert :: base64 encode (browser)', () => {
    equal(
      noBuffer(() => base64Encode('hello world')),
      'aGVsbG8gd29ybGQ='
    );
  });

  it('assert :: base64 decode (browser)', () => {
    equal(
      noBuffer(() => base64Decode('aGVsbG8gd29ybGQ=')),
      'hello world'
    );
  });
});
