import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createPolicy, createRole, isRole } from '@ez4/aws-identity';
import { deploy } from '@ez4/aws-common';

import { getRoleDocument } from './common/role.js';
import { getPolicyDocument } from './common/policy.js';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isRole(resource));

  const { roleName, roleArn, policyArns } = resource.result;

  ok(roleName);
  ok(roleArn);
  ok(policyArns);

  return {
    result: resource.result,
    state
  };
};

describe.only('role', () => {
  let lastState: EntryStates | undefined;
  let roleId: string | undefined;

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const policyResource = createPolicy(localState, {
      policyName: 'EZ4: Test role policy',
      policyDocument: getPolicyDocument()
    });

    const resource = createRole(localState, [policyResource], {
      roleName: 'EZ4: Test role',
      roleDocument: getRoleDocument(),
      description: 'EZ4 Test role',
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    roleId = resource.entryId;

    const { state } = await assertDeploy(roleId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(roleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[roleId];

    ok(resource && isRole(resource));

    resource.parameters.description = 'EZ4: Updated test role';

    const { state } = await assertDeploy(roleId, localState, lastState);

    lastState = state;
  });

  it('assert :: update document', async () => {
    ok(roleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[roleId];

    ok(resource && isRole(resource));

    resource.parameters.roleDocument = getRoleDocument('UpdatedRoleDocument');

    const { state } = await assertDeploy(roleId, localState, lastState);

    lastState = state;
  });

  it('assert :: attach policy', async () => {
    ok(roleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[roleId];

    ok(resource && isRole(resource));

    const policyResource = createPolicy(localState, {
      policyName: 'EZ4: Test role new policy',
      policyDocument: getPolicyDocument()
    });

    resource.dependencies.push(policyResource.entryId);

    const { state, result } = await assertDeploy(roleId, localState, lastState);

    equal(result.policyArns.length, 2);

    lastState = state;
  });

  it('assert :: detach policy', async () => {
    ok(roleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[roleId];

    ok(resource && isRole(resource));

    resource.dependencies.pop();

    const { state, result } = await assertDeploy(roleId, localState, lastState);

    equal(result.policyArns.length, 1);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(roleId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[roleId];

    ok(resource && isRole(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(roleId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(roleId && lastState);

    ok(lastState[roleId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[roleId], undefined);
  });
});
