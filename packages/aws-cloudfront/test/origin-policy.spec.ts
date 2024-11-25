import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createOriginPolicy, isOriginPolicyState, registerTriggers } from '@ez4/aws-cloudfront';
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
  ok(isOriginPolicyState(resource));

  const result = resource.result;

  ok(result.policyId);

  return {
    result,
    state
  };
};

describe.only('cloudfront :: origin policy', () => {
  let lastState: EntryStates | undefined;
  let policyId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createOriginPolicy(localState, {
      policyName: 'ez4-test-origin',
      description: 'EZ4: Test origin description'
    });

    policyId = resource.entryId;

    const { state } = await assertDeploy(policyId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(policyId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[policyId];

    ok(resource && isOriginPolicyState(resource));

    resource.parameters.description = 'EZ4: New origin description';

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
