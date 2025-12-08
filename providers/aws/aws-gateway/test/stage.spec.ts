import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createGateway, createStage, GatewayProtocol, isStageState, registerTriggers } from '@ez4/aws-gateway';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isStageState(resource));

  const { apiId, stageName } = resource.result;

  ok(apiId);
  ok(stageName);

  return {
    result: resource.result,
    state
  };
};

describe('gateway stage', () => {
  let lastState: EntryStates | undefined;
  let stageId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway',
      gatewayName: 'EZ4: Test gateway for stages',
      protocol: GatewayProtocol.Http
    });

    const resource = createStage(localState, gatewayResource, undefined, {
      autoDeploy: true,
      stageVariables: {
        test1: 'ez4-variable'
      }
    });

    stageId = resource.entryId;

    const { state } = await assertDeploy(stageId, localState, undefined);

    lastState = state;
  });

  it('assert :: update variables', async () => {
    ok(stageId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[stageId];

    ok(resource && isStageState(resource));

    resource.parameters.stageVariables = {
      test1: 'ez4-variable-update',
      test2: 'ez4-variable-new'
    };

    const { state } = await assertDeploy(stageId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(stageId && lastState);

    ok(lastState[stageId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[stageId], undefined);
  });
});
