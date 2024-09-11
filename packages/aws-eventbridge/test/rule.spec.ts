import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createRule, isRule } from '@ez4/aws-eventbridge';
import { deploy } from '@ez4/aws-common';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isRule(resource));

  const { ruleArn } = resource.result;

  ok(ruleArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('event bridge :: rule', () => {
  let lastState: EntryStates | undefined;
  let ruleId: string | undefined;

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createRule(localState, {
      ruleName: 'ez4-test-rule',
      expression: 'rate(1 minute)',
      enabled: true,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    ruleId = resource.entryId;

    const { state } = await assertDeploy(ruleId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(ruleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[ruleId];

    ok(resource && isRule(resource));

    resource.parameters.expression = 'rate(2 minutes)';
    resource.parameters.enabled = false;

    const { state } = await assertDeploy(ruleId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(ruleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[ruleId];

    ok(resource && isRule(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(ruleId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(ruleId && lastState);

    ok(lastState[ruleId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[ruleId], undefined);
  });
});
