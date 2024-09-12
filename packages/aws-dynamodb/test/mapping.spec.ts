import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';
import { join } from 'node:path';

import {
  AttributeKeyType,
  AttributeType,
  createStreamFunction,
  createMapping,
  createTable
} from '@ez4/aws-dynamodb';

import { createPolicy, createRole } from '@ez4/aws-identity';
import { isMapping } from '@ez4/aws-function';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

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
  ok(isMapping(resource));

  const { eventId, sourceArn } = resource.result;

  ok(eventId);
  ok(sourceArn);

  return {
    result: resource.result,
    state
  };
};

describe.only('dynamodb mapping', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let mappingId: string | undefined;

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const tableResource = createTable(localState, {
      tableName: 'ez4TestTableMapping',
      allowDeletion: true,
      enableStreams: true,
      attributeSchema: [
        {
          attributeName: 'id',
          attributeType: AttributeType.String,
          keyType: AttributeKeyType.Hash
        }
      ]
    });

    const policyResource = createPolicy(localState, {
      policyName: 'EZ4: Test table mapping policy',
      policyDocument: getPolicyDocument()
    });

    const roleResource = createRole(localState, [policyResource], {
      roleName: 'EZ4: Test table mapping role',
      roleDocument: getRoleDocument()
    });

    const functionResource = await createStreamFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda.js'),
      functionName: 'EZ4: Test table mapping lambda',
      handlerName: 'main'
    });

    const resource = createMapping(localState, tableResource, functionResource, {
      enabled: true
    });

    mappingId = resource.entryId;

    const { state } = await assertDeploy(mappingId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(mappingId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[mappingId];

    ok(resource && isMapping(resource));

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
