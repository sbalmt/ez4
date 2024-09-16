import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createCachePolicy, isCachePolicyState, registerTriggers } from '@ez4/aws-cloudfront';
import { deploy } from '@ez4/aws-common';

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
  let policyId: string | undefined;

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

    policyId = resource.entryId;

    const { state } = await assertDeploy(policyId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(policyId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[policyId];

    ok(resource && isCachePolicyState(resource));

    resource.parameters.description = 'EZ4: New policy description';
    resource.parameters.defaultTTL = 180;
    resource.parameters.compress = false;

    const { state } = await assertDeploy(policyId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(policyId && lastState);

    ok(lastState[policyId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[policyId], undefined);
  });
});
