import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DistributionServiceName,
  createDistribution,
  createOriginAccess,
  createOriginPolicy,
  createCachePolicy,
  getOriginPolicyId,
  getCachePolicyId,
  registerTriggers,
  isDistributionState,
  isCachePolicyState
} from '@ez4/aws-cloudfront';

import { createBucket, getBucketDomain } from '@ez4/aws-bucket';
import { deploy } from '@ez4/aws-common';
import { deepClone } from '@ez4/utils';

const assertDeploy = async <E extends EntryState>(resourceId: string, newState: EntryStates<E>, oldState: EntryStates<E> | undefined) => {
  const { result: state } = await deploy(newState, oldState);

  const resource = state[resourceId];

  ok(resource?.result);
  ok(isDistributionState(resource));

  const result = resource.result;

  ok(result.endpoint);
  ok(result.distributionId);
  ok(result.distributionArn);
  ok(result.originAccessId);
  ok(result.defaultOrigin);
  ok(result.origins);

  return {
    result,
    state
  };
};

describe('cloudfront :: distribution', () => {
  let lastState: EntryStates | undefined;
  let distributionId: string | undefined;
  let cachePolicyId: string | undefined;

  registerTriggers();

  it('assert :: deploy', async () => {
    const localState: EntryStates = {};

    const originBucketName = 'ez4-test-distribution-bucket';

    const bucketResource = createBucket(localState, undefined, {
      bucketName: originBucketName
    });

    const originPolicyResource = createOriginPolicy(localState, {
      policyName: 'ez4-test-distribution-origin',
      description: 'EZ4: Test origin description'
    });

    const originAccessResource = createOriginAccess(localState, {
      accessName: 'ez4-test-distribution-access',
      description: 'EZ4: Test access description'
    });

    const cachePolicyResource = createCachePolicy(localState, {
      policyName: 'ez4-test-distribution-cache',
      description: 'EZ4: Test cache description',
      cacheKeys: {},
      defaultTTL: 300,
      maxTTL: 3600,
      minTTL: 1
    });

    const distributionResource = createDistribution(
      localState,
      originAccessResource,
      originPolicyResource,
      [cachePolicyResource],
      undefined, // Don't issue certificate.
      {
        distributionName: 'ez4-test-distribution',
        description: 'EZ4: Test distribution description',
        enabled: true,
        defaultOrigin: {
          id: 's3-bucket',
          location: '/home',
          domain: originBucketName,
          getDistributionOrigin: async (context) => {
            const originPolicyId = getOriginPolicyId(DistributionServiceName, cachePolicyResource.entryId, context);
            const cachePolicyId = getCachePolicyId(DistributionServiceName, cachePolicyResource.entryId, context);

            return {
              domain: await getBucketDomain(originBucketName),
              originPolicyId,
              cachePolicyId
            };
          }
        },
        origins: [
          {
            id: 'ez4-test',
            path: 'test*',

            headers: {
              ['x-custom-header']: 'ez4-custom-value'
            },
            domain: 'unresolved.ez4.test',
            getDistributionOrigin: (context) => {
              const originPolicyId = getOriginPolicyId(DistributionServiceName, cachePolicyResource.entryId, context);
              const cachePolicyId = getCachePolicyId(DistributionServiceName, cachePolicyResource.entryId, context);

              return {
                domain: 'resolved.ez4.test',
                originPolicyId,
                cachePolicyId
              };
            }
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
      }
    );

    distributionResource.dependencies.push(bucketResource.entryId);

    distributionId = distributionResource.entryId;
    cachePolicyId = cachePolicyResource.entryId;

    const { state } = await assertDeploy(distributionId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(distributionId && cachePolicyId && lastState);

    const localState = deepClone(lastState);

    const distributionResource = localState[distributionId];
    const cachePolicyResource = localState[cachePolicyId];

    ok(distributionResource && isDistributionState(distributionResource));
    ok(cachePolicyResource && isCachePolicyState(cachePolicyResource));

    ok(distributionResource.parameters.origins);

    distributionResource.parameters.origins.push({
      id: 'ez4-test-new',
      path: 'test-new*',
      domain: 'resolved.ez4.test',
      getDistributionOrigin: (context) => {
        const originPolicyId = getOriginPolicyId(DistributionServiceName, cachePolicyResource.entryId, context);
        const cachePolicyId = getCachePolicyId(DistributionServiceName, cachePolicyResource.entryId, context);

        return {
          domain: 'ez4.test.new',
          originPolicyId,
          cachePolicyId
        };
      }
    });

    distributionResource.parameters.tags = {
      test2: 'ez4-tag2'
    };

    const { state } = await assertDeploy(distributionId, localState, lastState);

    lastState = state;
  });

  it('assert :: update tags', async () => {
    ok(distributionId && lastState);

    const localState = deepClone(lastState);
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
