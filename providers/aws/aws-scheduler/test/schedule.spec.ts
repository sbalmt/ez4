import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import { createSchedule, createTargetFunction, isScheduleState, registerTriggers } from '@ez4/aws-scheduler';

import { deploy } from '@ez4/aws-common';
import { createLogGroup } from '@ez4/aws-logs';
import { createRole } from '@ez4/aws-identity';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isScheduleState(resource));

  const { scheduleArn, functionArn, roleArn } = resource.result;

  ok(scheduleArn);
  ok(functionArn);
  ok(roleArn);

  return {
    result: resource.result,
    state
  };
};

describe('scheduler', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let scheduleId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-scheduler-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-scheduler-logs',
      retention: 1
    });

    const lambdaResource = createTargetFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-scheduler-lambda',
      handler: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const resource = createSchedule(localState, roleResource, lambdaResource, undefined, {
      scheduleName: 'ez4-test-scheduler',
      expression: 'rate(1 minute)',
      description: 'EZ4: Test scheduler',
      dynamic: false,
      enabled: true
    });

    scheduleId = resource.entryId;

    const { state } = await assertDeploy(scheduleId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(scheduleId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[scheduleId];

    ok(resource && isScheduleState(resource));

    resource.parameters.expression = 'rate(2 minutes)';
    resource.parameters.timezone = 'America/Sao_Paulo';
    resource.parameters.startDate = '2024-04-23T00:00:00Z';
    resource.parameters.endDate = '2024-04-23:59:59Z';
    resource.parameters.enabled = false;

    const { state } = await assertDeploy(scheduleId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(scheduleId && lastState);

    ok(lastState[scheduleId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[scheduleId], undefined);
  });
});
