import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createOriginAccess, isOriginAccessState, registerTriggers } from '@ez4/aws-cloudfront';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isOriginAccessState(resource));

  const result = resource.result;

  ok(result.accessId);

  return {
    result,
    state
  };
};

describe('cloudfront :: origin access', () => {
  let lastState: EntryStates | undefined;
  let accessId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createOriginAccess(localState, {
      accessName: 'ez4-test-access',
      description: 'EZ4: Test access description'
    });

    accessId = resource.entryId;

    const { state } = await assertDeploy(accessId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(accessId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[accessId];

    ok(resource && isOriginAccessState(resource));

    resource.parameters.description = 'EZ4: New access description';

    const { state } = await assertDeploy(accessId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(accessId && lastState);

    ok(lastState[accessId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[accessId], undefined);
  });
});
