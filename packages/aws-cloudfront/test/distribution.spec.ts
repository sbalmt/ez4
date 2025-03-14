import type { EntryState, EntryStates } from '@ez4/stateful';

import { ok, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createOriginAccess,
  createCachePolicy,
  createDistribution,
  isDistributionState,
  registerTriggers,
  createOriginPolicy
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

  ok(result.distributionId);
  ok(result.distributionArn);
  ok(result.originAccessId);
  ok(result.cachePolicyIds);
  ok(result.endpoint);

  return {
    result,
    state
  };
};

describe('cloudfront :: distribution', () => {
  let lastState: EntryStates | undefined;
  let distributionId: string | undefined;

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
      defaultTTL: 300,
      maxTTL: 3600,
      minTTL: 1
    });

    const resource = createDistribution(
      localState,
      originAccessResource,
      originPolicyResource,
      undefined, // Don't issue certificate.
      {
        distributionName: 'ez4-test-distribution',
        description: 'EZ4: Test distribution description',
        enabled: true,
        defaultOrigin: {
          id: 's3-bucket',
          location: '/home',
          cachePolicyId: cachePolicyResource.entryId,
          getDistributionOrigin: async () => {
            const domain = await getBucketDomain(originBucketName);

            return {
              domain
            };
          }
        },
        origins: [
          {
            id: 'ez4-test',
            path: 'test*',
            cachePolicyId: cachePolicyResource.entryId,
            getDistributionOrigin: () => {
              return {
                domain: 'ez4.test',
                headers: {
                  ['x-custom-header']: 'ez4-custom-value'
                }
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

    resource.dependencies.push(bucketResource.entryId);

    distributionId = resource.entryId;

    const { state } = await assertDeploy(distributionId, localState, undefined);

    lastState = state;
  });

  it('assert :: update', async () => {
    ok(distributionId && lastState);

    const localState = deepClone(lastState);
    const resource = localState[distributionId];

    ok(resource && isDistributionState(resource));
    ok(resource.parameters.origins);

    const { cachePolicyId } = resource.parameters.defaultOrigin;

    resource.parameters.origins.push({
      id: 'ez4-test-new',
      path: 'test-new*',
      cachePolicyId,
      getDistributionOrigin: () => {
        return {
          domain: 'ez4.test.new'
        };
      }
    });

    resource.parameters.tags = {
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
