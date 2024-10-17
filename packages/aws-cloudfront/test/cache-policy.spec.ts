import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCachePolicy, isCachePolicyState, registerTriggers } from '@ez4/aws-cloudfront';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isCachePolicyState(resource));

  const result = resource.result;

  ok(result.policyId);

  return {
    result,
    state
  };
};

describe.only('cloudfront :: cache policy', () => {
  let lastState: EntryStates | undefined;
  let cacheId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createCachePolicy(localState, {
      policyName: 'ez4-test-policy',
      description: 'EZ4: Test policy description',
      compress: true,
      defaultTTL: 300,
      maxTTL: 3600,
      minTTL: 1
    });

    cacheId = resource.entryId;

    const { state } = await assertDeploy(cacheId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(cacheId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[cacheId];

    ok(resource && isCachePolicyState(resource));

    resource.parameters.description = 'EZ4: New policy description';
    resource.parameters.defaultTTL = 180;
    resource.parameters.compress = false;

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
