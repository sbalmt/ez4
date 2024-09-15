import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createAccess, isAccess, registerTriggers } from '@ez4/aws-cloudfront';
import { deploy } from '@ez4/aws-common';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isAccess(resource));

  const { accessId, version } = resource.result;

  ok(accessId);
  ok(version);

  return {
    result: resource.result,
    state
  };
};

describe.only('access resources', () => {
  let lastState: EntryStates | undefined;
  let accessId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createAccess(localState, {
      accessName: 'ez4-test-access',
      description: 'EZ4: Test access description'
    });

    accessId = resource.entryId;

    const { state } = await assertDeploy(accessId, localState, undefined);

    lastState = state;
  });

  it('assert :: update gateway', async () => {
    ok(accessId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[accessId];

    ok(resource && isAccess(resource));

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
