import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCertificate, isCertificateState, registerTriggers } from '@ez4/aws-certificate';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isCertificateState(resource));

  const result = resource.result;

  ok(result.certificateArn);

  return {
    result,
    state
  };
};

describe('certificate resources', () => {
  let lastState: EntryStates | undefined;
  let certificateId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const resource = createCertificate(localState, {
      domainName: '*.easyfor.dev',
      allowDeletion: true,
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    certificateId = resource.entryId;

    const { state } = await assertDeploy(certificateId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(certificateId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[certificateId];

    ok(resource && isCertificateState(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(certificateId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(certificateId && lastState);

    ok(lastState[certificateId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[certificateId], undefined);
  });
});
