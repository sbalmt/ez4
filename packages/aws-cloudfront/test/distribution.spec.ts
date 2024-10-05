import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createOriginAccess,
  createCachePolicy,
  createDistribution,
  isDistributionState,
  registerTriggers
} from '@ez4/aws-cloudfront';

import { createBucket, getBucketDomain } from '@ez4/aws-bucket';
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
  ok(isDistributionState(resource));

  const result = resource.result;

  ok(result.distributionId);
  ok(result.distributionArn);
  ok(result.originAccessId);
  ok(result.cachePolicyId);
  ok(result.endpoint);

  return {
    result,
    state
  };
};

describe.only('cloudfront :: distribution', () => {
  let lastState: EntryStates | undefined;
  let distributionId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const originBucketName = 'ez4-test-distribution-bucket';

    const bucketResource = createBucket(localState, {
      bucketName: originBucketName
    });

    const originAccessResource = createOriginAccess(localState, {
      accessName: 'ez4-test-distribution-access',
      description: 'EZ4: Test access description'
    });

    const cachePolicyResource = createCachePolicy(localState, {
      policyName: 'ez4-test-distribution-policy',
      description: 'EZ4: Test policy description',
      defaultTTL: 300,
      minTTL: 1,
      maxTTL: 3600
    });

    const resource = createDistribution(localState, originAccessResource, cachePolicyResource, {
      distributionName: 'ez4-test-distribution',
      description: 'EZ4: Test distribution description',
      enabled: true,
      defaultOrigin: {
        id: 's3-bucket',
        domain: await getBucketDomain(originBucketName),
        location: '/home'
      },
      origins: [
        {
          id: 'ez4-test',
          domain: 'ez4.test',
          path: 'test*'
        }
      ],
      customErrors: [
        {
          code: 404,
          location: '/home',
          ttl: 300
        }
      ],
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

    ok(resource && isDistributionState(resource));

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
