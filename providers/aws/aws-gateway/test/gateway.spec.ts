import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { createGateway, GatewayProtocol, isGatewayState, registerTriggers } from '@ez4/aws-gateway';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isGatewayState(resource));

  const { apiId, apiArn, endpoint } = resource.result;

  ok(apiId);
  ok(apiArn);
  ok(endpoint);

  return {
    result: resource.result,
    state
  };
};

describe('gateway', () => {
  let lastState: EntryStates | undefined;
  let gatewayId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway',
      gatewayName: 'EZ4: Test gateway',
      description: 'EZ4: Test gateway description',
      protocol: GatewayProtocol.Http,
      cors: {
        allowOrigins: ['*'],
        allowHeaders: ['x-custom-header']
      },
      tags: {
        test1: 'ez4-tag'
      }
    });

    gatewayId = resource.entryId;

    const { state } = await assertDeploy(gatewayId, localState, undefined);

    lastState = state;
  });

  it('assert :: tag gateway', async () => {
    ok(gatewayId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[gatewayId];

    ok(resource && isGatewayState(resource));

    resource.parameters.tags = {
      test1: 'ez4-tag-update',
      test2: 'ez4-tag-new'
    };

    const { state } = await assertDeploy(gatewayId, localState, lastState);

    lastState = state;
  });

  it('assert :: update gateway', async () => {
    ok(gatewayId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[gatewayId];

    ok(resource && isGatewayState(resource));

    resource.parameters.gatewayName = 'EZ4: New gateway name';
    resource.parameters.description = 'EZ4: New gateway description';

    if (resource.parameters.protocol === GatewayProtocol.Http) {
      resource.parameters.cors = undefined;
    }

    const { state } = await assertDeploy(gatewayId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(gatewayId && lastState);

    ok(lastState[gatewayId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[gatewayId], undefined);
  });
});
