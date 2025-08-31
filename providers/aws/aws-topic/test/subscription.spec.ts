import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { createSubscriptionFunction, createSubscription, createTopic, registerTriggers, isSubscriptionState } from '@ez4/aws-topic';
import { createPolicy, createRole } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';
import { deploy } from '@ez4/aws-common';

import { getPolicyDocument } from './common/policy.js';
import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
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

describe('topic subscription', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let subscriptionId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const topicResource = createTopic(localState, {
      topicName: 'ez4-test-topic-subscription',
      fifoMode: false
    });

    const policyResource = createPolicy(localState, {
      policyName: 'ez4-test-topic-subscription-policy',
      policyDocument: getPolicyDocument()
    });

    const roleResource = createRole(localState, [policyResource], {
      roleName: 'ez4-test-topic-subscription-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-topic-subscription-logs',
      retention: 1
    });

    const functionResource = createSubscriptionFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-topic-subscription-lambda',
      handler: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const resource = createSubscription(localState, topicResource, functionResource, {
      fromService: topicResource.parameters.topicName
    });

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
