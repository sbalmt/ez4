import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal, notEqual } from 'node:assert/strict';

import { createPolicy, isPolicyState, registerTriggers } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getPolicyDocument } from './common/policy.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isPolicyState(resource));

  const { policyArn, currentVersion, versionHistory } = resource.result;

  ok(policyArn);
  ok(currentVersion);
  ok(versionHistory);

  return {
    result: resource.result,
    state
  };
};

describe('policy', () => {
  let lastState: EntryStates | undefined;
  let policyId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createPolicy(localState, {
      policyName: 'ez4-test-policy',
      policyDocument: getPolicyDocument(),
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    policyId = resource.entryId;

    const { state } = await assertDeploy(policyId, localState, undefined);

    lastState = state;
  });

  // A managed policy can have up to 5 versions.
  // https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-versioning.html
  it('assert :: update document', async () => {
    for await (const versionId of [1, 2, 3, 4, 5, 6]) {
      ok(policyId && lastState);

      const localState = deepClone(lastState);
      const resource = localState[policyId];

      ok(resource && isPolicyState(resource));

      resource.parameters.policyDocument = getPolicyDocument(`Update${versionId}`);

      const { state, result } = await assertDeploy(policyId, localState, lastState);

      equal(result.versionHistory.length, Math.min(versionId, 4));
      notEqual(result.currentVersion, result.versionHistory[versionId - 1]);

      lastState = state;
    }
  });

  it('assert :: update tags', async () => {
    ok(policyId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[policyId];

    ok(resource && isPolicyState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

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
