import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { createPolicy, createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';

import {
  createSubscriptionFunction,
  createSubscription,
  createTopic,
  registerTriggers,
  isSubscriptionState
} from '@ez4/aws-notification';

import { getPolicyDocument } from './common/policy.js';
import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isSubscriptionState(resource));

  const { subscriptionArn } = resource.result;

  ok(subscriptionArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('notification subscription', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let subscriptionId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const topicResource = createTopic(localState, {
      topicName: 'ez4-test-notification-topic-subscriptions'
    });

    const policyResource = createPolicy(localState, {
      policyName: 'EZ4: Test notification subscription policy',
      policyDocument: getPolicyDocument()
    });

    const roleResource = createRole(localState, [policyResource], {
      roleName: 'EZ4: Test notification subscription role',
      roleDocument: getRoleDocument()
    });

    const functionResource = createSubscriptionFunction(localState, roleResource, {
      functionName: 'EZ4: Test notification subscription lambda',
      handler: {
        functionName: 'main',
        sourceFile: join(baseDir, 'lambda.js')
      }
    });

    const resource = createSubscription(localState, topicResource, functionResource);

    subscriptionId = resource.entryId;

    const { state } = await assertDeploy(subscriptionId, localState, undefined);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(subscriptionId && lastState);

    ok(lastState[subscriptionId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[subscriptionId], undefined);
  });
});
