import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal, notEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { join } from 'node:path';

import { createFunction, isFunctionState, registerTriggers } from '@ez4/aws-function';
import { createLogGroup } from '@ez4/aws-logs';
import { createRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

import { getRoleDocument } from './common/role';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
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

describe('function', () => {
  const baseDir = 'test/files';

  let lastState: EntryStates | undefined;
  let functionId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const roleResource = createRole(localState, [], {
      roleName: 'ez4-test-lambda-role',
      roleDocument: getRoleDocument()
    });

    const logGroupResource = createLogGroup(localState, {
      groupName: 'ez4-test-lambda-logs',
      retention: 14
    });

    const sourceFile = join(baseDir, 'lambda-1.js');

    const resource = createFunction(localState, roleResource, logGroupResource, {
      functionName: 'ez4-test-lambda-function',
      description: 'EZ4 Test lambda',
      handlerName: 'main',
      sourceFile,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      },
      getFunctionVariables: () => ({
        test1: 'ez4-variable'
      }),
      getFunctionFiles: () => {
        return [sourceFile, [sourceFile]];
      },
      getFunctionBundle: () => {
        return sourceFile;
      },
      getFunctionHash: () => {
        return undefined;
      }
    });

    functionId = resource.entryId;

    const { state } = await assertDeploy(functionId, localState, undefined);

    lastState = state;
  });

  it('assert :: update configuration', async () => {
    ok(functionId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[functionId];

    ok(resource && isFunctionState(resource));

    resource.parameters.timeout = 10;
    resource.parameters.memory = 256;

    resource.parameters.getFunctionVariables = () => ({
      test1: 'ez4-variable',
      test2: 'ez4-variable-new'
    });

    const { state } = await assertDeploy(functionId, localState, lastState);

    lastState = state;
  });

  it('assert :: update source code', async () => {
    ok(functionId && lastState);

    const localState = deepClone(lastState);

    const lastResource = lastState[functionId];
    const resource = localState[functionId];

    ok(lastResource && isFunctionState(lastResource));
    ok(resource && isFunctionState(resource));

    const sourceFile = join(baseDir, 'lambda-2.js');

    resource.parameters.sourceFile = sourceFile;

    resource.parameters.getFunctionBundle = () => {
      return sourceFile;
    };

    resource.parameters.getFunctionFiles = () => {
      return [sourceFile, [sourceFile]];
    };

    const { state, result } = await assertDeploy(functionId, localState, lastState);

    ok(lastResource.result?.sourceHash);
    ok(result.sourceHash);

    notEqual(lastResource.result.sourceHash, result.sourceHash);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(functionId && lastState);

    const localState = deepClone(lastState);
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
