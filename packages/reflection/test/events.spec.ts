import type { ResolverEvents } from '@ez4/reflection';

import { strictEqual } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { reflectionFromFiles } from '@ez4/reflection';

const testFile = (fileName: string, eventName: keyof ResolverEvents, callCount: number) => {
  const sourceFile = `./test/events/${fileName}.ts`;
  const eventFunction = mock.fn();

  reflectionFromFiles([sourceFile], {
    resolverEvents: {
      [eventName]: eventFunction
    }
  });

  strictEqual(eventFunction.mock.callCount(), callCount);
};

describe('reflection events', () => {
  it('assert :: any', () => testFile('any', 'onTypeAny', 1));
  it('assert :: void', () => testFile('void', 'onTypeVoid', 1));
  it('assert :: never', () => testFile('never', 'onTypeNever', 1));
  it('assert :: unknown', () => testFile('unknown', 'onTypeUnknown', 1));
  it('assert :: undefined', () => testFile('undefined', 'onTypeUndefined', 1));
  it('assert :: null', () => testFile('null', 'onTypeNull', 1));
  it('assert :: boolean', () => testFile('boolean', 'onTypeBoolean', 3));
  it('assert :: number', () => testFile('number', 'onTypeNumber', 3));
  it('assert :: string', () => testFile('string', 'onTypeString', 3));
  it('assert :: object', () => testFile('object', 'onTypeObject', 3));
  it('assert :: reference', () => testFile('reference', 'onTypeReference', 3));
});
