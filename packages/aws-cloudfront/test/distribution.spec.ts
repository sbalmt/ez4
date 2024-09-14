import type { EntryState, EntryStates } from '@ez4/stateful';

import { describe, it } from 'node:test';
import { ok, equal } from 'node:assert/strict';

import { deepClone } from '@ez4/utils';
import { createDistribution, isDistribution, registerTriggers } from '@ez4/aws-cloudfront';
import { createBucket, getBucketDomain } from '@ez4/aws-bucket';
import { deploy } from '@ez4/aws-common';

const assertDeploy = async <E extends EntryState>(
  resourceId: string,
  newState: EntryStates<E>,
  oldState: EntryStates<E> | undefined
) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isDistribution(resource));

  const { distributionId, distributionArn, endpoint, version } = resource.result;

  ok(distributionId);
  ok(distributionArn);
  ok(endpoint);
  ok(version);

  return {
    result: resource.result,
    state
  };
};

describe.only('distribution resources', () => {
  let lastState: EntryStates | undefined;
  let distributionId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const originBucketName = 'ez4-test-distribution-bucket';

    const bucketResource = createBucket(localState, {
      bucketName: originBucketName
    });

    const resource = createDistribution(localState, {
      distributionName: 'ez4-test-distribution',
      description: 'EZ4: Test distribution',
      enabled: true,
      defaultOrigin: {
        id: 's3-bucket',
        domainName: await getBucketDomain(originBucketName),
        originPath: '/assets'
      },
      tags: {
        test1: 'ez4-tag1',
        test2: 'ez4-tag2'
      }
    });

    resource.dependencies.push(bucketResource.entryId);

    distributionId = resource.entryId;

    const { state } = await assertDeploy(distributionId, localState, undefined);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(distributionId && lastState);

    const localState = deepClone(lastState) as EntryStates;
    const resource = localState[distributionId];

    ok(resource && isDistribution(resource));

    resource.parameters.tags = {
      test2: 'ez4-tag2',
      test3: 'ez4-tag3'
    };

    const { state } = await assertDeploy(distributionId, localState, lastState);

    lastState = state;
  });

  it('assert :: destroy', async () => {
    ok(distributionId && lastState);

    ok(lastState[distributionId]);

    const { result } = await deploy(undefined, lastState);

    equal(result[distributionId], undefined);
  });
});
