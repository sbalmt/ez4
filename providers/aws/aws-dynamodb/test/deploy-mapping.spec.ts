import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { join } from 'node:path';

import { AttributeKeyType, AttributeType, createStreamFunction, createMapping, createTable, registerTriggers } from '@ez4/aws-dynamodb';
import { ArchitectureType, RuntimeType } from '@ez4/common';
import { createPolicy, createRole } from '@ez4/aws-identity';
import { isMappingState } from '@ez4/aws-function';
import { createLogGroup } from '@ez4/aws-logs';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getPolicyDocument } from './common/policy';
import { getRoleDocument } from './common/role';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isMappingState(resource));

  const result = resource.result;

  ok(result.eventId);
  ok(result.sourceArn);

  return {
    result,
    state
  };
};

describe('dynamodb mapping', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let mappingId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const tableResource = createTable(localState, {
      tableName: 'ez4TestTableMapping',
      allowDeletion: true,
      enableStreams: true,
      attributeSchema: [
        [
          {
            attributeName: 'id',
            attributeType: AttributeType.String,
            keyType: AttributeKeyType.Hash
          }
        ]
      ]
    });

    const policyResource = createPolicy(localState, {
      policyName: 'ez4-test-table-mapping-policy',
      policyDocument: getPolicyDocument()
    });

    const roleResource = createRole(localState, [policyResource], {
      roleName: 'ez4-test-table-mapping-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-table-mapping-logs',
      retention: 1
    });

    const functionResource = createStreamFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-table-mapping-lambda',
      architecture: ArchitectureType.Arm,
      runtime: RuntimeType.Node24,
      variables: [],
      handler: {
        sourceFile: join(baseDir, 'lambda.js'),
        functionName: 'main',
        dependencies: []
      }
    });

    const resource = createMapping(localState, tableResource, functionResource, {
      fromService: functionResource.parameters.functionName,
      enabled: true
    });

    mappingId = resource.entryId;

    const { state } = await assertDeploy(mappingId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(mappingId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[mappingId];

    ok(resource && isMappingState(resource));

    resource.parameters.enabled = false;

    const { state } = await assertDeploy(mappingId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(mappingId && lastState);

    ok(lastState[mappingId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[mappingId], undefined);
  });
});
