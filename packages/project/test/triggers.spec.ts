import type { SyncEvent } from '@ez4/project/library';

import { describe, it, mock } from 'node:test';
import { equal } from 'node:assert/strict';

import { createTrigger, triggerAllSync } from '@ez4/project/library';

const assertSyncEvent = (event: keyof SyncEvent) => {
  const handler = mock.fn();

  createTrigger(`Trigger:${event}`, {
    [event]: handler
  });

  triggerAllSync(event, (handler) => handler(undefined as any));

  equal(handler.mock.callCount(), 1);
};

describe('project triggers', () => {
  it('reflection :: load file', () => assertSyncEvent('reflection:loadFile'));
  it('reflection :: type object', () => assertSyncEvent('reflection:typeObject'));
  it('metadata :: get services', () => assertSyncEvent('metadata:getServices'));
  it('metadata :: get linked services', () => assertSyncEvent('metadata:getLinkedService'));
});
