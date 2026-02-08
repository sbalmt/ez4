import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createIdentity, isIdentityState, registerTriggers } from '@ez4/aws-email';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isIdentityState(resource));

  const { identityArn } = resource.result;

  ok(identityArn);

  return {
    result: resource.result,
    state
  };
};

describe('email', () => {
  let lastState: EntryStates | undefined;
  let identityId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createIdentity(localState, {
      identity: 'test.ez4.dev',
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    identityId = resource.entryId;

    const { state } = await assertDeploy(identityId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(identityId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[identityId];

    ok(resource && isIdentityState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(identityId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(identityId && lastState);

    ok(lastState[identityId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[identityId], undefined);
  });
});
