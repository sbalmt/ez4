import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createCache, isCacheState, registerTriggers } from '@ez4/aws-valkey';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isCacheState(resource));

  const { cacheArn, readerEndpoint, writerEndpoint } = resource.result;

  ok(cacheArn);
  ok(readerEndpoint);
  ok(writerEndpoint);

  return {
    result: resource.result,
    state
  };
};

describe('deploy cache', () => {
  let lastState: EntryStates | undefined;
  let cacheId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createCache(localState, {
      name: 'ez4-valkey-cache',
      description: 'EZ4 Valkey cache test',
      allowDeletion: true,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    cacheId = resource.entryId;

    const { state } = await assertDeploy(cacheId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(cacheId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[cacheId];

    ok(resource && isCacheState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(cacheId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(cacheId && lastState);

    ok(lastState[cacheId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[cacheId], undefined);
  });
});
