import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  createSchedule,
  createTargetFunction,
  isScheduleState,
  registerTriggers
} from '@ez4/aws-scheduler';

import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
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

describe.only('scheduler', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let scheduleId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-lambda-scheduler-role',
      roleDocument: getRoleDocument()
    });

    const lambdaResource = await createTargetFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'ez4-test-scheduler-lambda',
      handlerName: 'main'
    });

    const resource = createSchedule(localState, roleResource, lambdaResource, {
      scheduleName: 'ez4-test-scheduler',
      expression: 'rate(1 minute)',
      description: 'EZ4: Test scheduler',
      enabled: true
    });

    scheduleId = resource.entryId;

    const { state } = await assertDeploy(scheduleId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(scheduleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
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
