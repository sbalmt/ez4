import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { createRule, createTarget, createTargetFunction, isTarget } from '@ez4/aws-scheduler';

import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';

import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isTarget(resource));

  const { ruleName, targetId, functionArn } = resource.result;

  ok(ruleName);
  ok(targetId);
  ok(functionArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('scheduler :: target', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let targetId: string | undefined;

  it.only('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const ruleResource = createRule(localState, {
      ruleName: 'ez4-test-rule',
      expression: 'rate(1 minute)',
      enabled: true
    });

    const roleResource = createRole(localState, [], {
      roleName: 'EZ4: Test lambda rule role',
      roleDocument: getRoleDocument()
    });

    const lambdaResource = await createTargetFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'EZ4: Test rule lambda',
      handlerName: 'main'
    });

    const resource = createTarget(localState, ruleResource, lambdaResource);

    targetId = resource.entryId;

    const { state } = await assertDeploy(targetId, localState, undefined);

    lastState = state;
  });

  it.only('assert :: destroy', async () => {
    ok(targetId && lastState);

    ok(lastState[targetId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[targetId], undefined);
  });
});
