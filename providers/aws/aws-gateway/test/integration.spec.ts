import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  createGateway,
  createIntegration,
  createIntegrationFunction,
  isIntegrationState,
  registerTriggers,
  IntegrationFunctionType,
  GatewayProtocol
} from '@ez4/aws-gateway';

import { ArchitectureType, RuntimeType } from '@ez4/common';
import { createLogGroup } from '@ez4/aws-logs';
import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isIntegrationState(resource));

  const { apiId, integrationId, functionArn } = resource.result;

  ok(apiId);
  ok(integrationId);
  ok(functionArn);

  return {
    result: resource.result,
    state
  };
};

describe('gateway integration', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let integrationId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const gatewayResource = createGateway(localState, {
      gatewayId: 'ez4-test-gateway-integration',
      gatewayName: 'EZ4: Test gateway for integrations',
      protocol: GatewayProtocol.Http
    });

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-gateway-integration-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-gateway-integration-logs',
      retention: 1
    });

    const lambdaResource = createIntegrationFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-gateway-integration-lambda',
      type: IntegrationFunctionType.HttpRequest,
      architecture: ArchitectureType.Arm,
      runtime: RuntimeType.Node24,
      variables: [],
      handler: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const resource = createIntegration(localState, gatewayResource, lambdaResource, {
      fromService: lambdaResource.parameters.functionName,
      description: 'EZ4: Test integration'
    });

    integrationId = resource.entryId;

    const { state } = await assertDeploy(integrationId, localState, undefined);

    lastState = state;
  });

  it('assert :: update integration', async () => {
    ok(integrationId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[integrationId];

    ok(resource && isIntegrationState(resource));

    resource.parameters.description = 'EZ4: New integration description';

    const { state } = await assertDeploy(integrationId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(integrationId && lastState);

    ok(lastState[integrationId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[integrationId], undefined);
  });
});
