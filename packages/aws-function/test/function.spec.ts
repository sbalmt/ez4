import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal, notEqual } from 'node:assert/strict';
import { join } from 'node:path';

import { createFunction, isFunctionState, registerTriggers } from '@ez4/aws-function';
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
  ok(isFunctionState(resource));

  const { functionArn, roleArn, sourceHash } = resource.result;

  ok(functionArn);
  ok(roleArn);
  ok(sourceHash);

  return {
    result: resource.result,
    state
  };
};

describe.only('function', () => {
  const baseDir = join(import.meta.dirname, '../test/files');

  let lastState: EntryStates | undefined;
  let functionId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-lambda-role',
      roleDocument: getRoleDocument()
    });

    const resource = createFunction(localState, roleResource, {
      sourceFile: join(baseDir, 'lambda-1.js'),
      functionName: 'ez4-test-lambda-function',
      description: 'EZ4 Test lambda',
      handlerName: 'main',
      variables: {
        test1: 'ez4-variable'
      },
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    functionId = resource.entryId;

    const { state } = await assertDeploy(functionId, localState, undefined);

    lastState = state;
  });

  it('assert :: update configuration', async () => {
    ok(functionId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[functionId];

    ok(resource && isFunctionState(resource));

    resource.parameters.timeout = 10;
    resource.parameters.memory = 256;

    resource.parameters.variables = {
      test1: 'ez4-variable',
      test2: 'ez4-variable-new'
    };

    const { state } = await assertDeploy(functionId, localState, lastState);

    lastState = state;
  });

  it('assert :: update source code', async () => {
    ok(functionId && lastState);

    const localState = deepClone(lastState) as EntryStates;

    const lastResult = lastState[functionId]?.result;
    const resource = localState[functionId];

    ok(resource && isFunctionState(resource));
    ok(lastResult);

    resource.parameters.sourceFile = join(baseDir, 'lambda-2.js');

    const { state, result } = await assertDeploy(functionId, localState, lastState);

    ok(lastResult.sourceHash);
    ok(result.sourceHash);

    notEqual(lastResult.sourceHash, result.sourceHash);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(functionId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[functionId];

    ok(resource && isFunctionState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(functionId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(functionId && lastState);

    ok(lastState[functionId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[functionId], undefined);
  });
});
