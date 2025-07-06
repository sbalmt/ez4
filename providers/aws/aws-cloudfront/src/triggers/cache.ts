import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';

import { CdnService, CdnOrigin, isCdnBucketOrigin } from '@ez4/distribution/library';
import { getBucketDomain, getBucketState } from '@ez4/aws-bucket';
import { getServiceName } from '@ez4/project/library';
import { OriginProtocol } from '@ez4/distribution';

import { DistributionAdditionalOrigin, DistributionDefaultOrigin, DistributionServiceName } from '../distribution/types.js';
import { createCachePolicy } from '../cache/service.js';
import { getOriginPolicyId } from '../origin/utils.js';
import { getCachePolicyId } from '../cache/utils.js';
import { getCachePolicyName } from './utils.js';

export const getDefaultOriginCache = (state: EntryStates, service: CdnService, options: DeployOptions, context: EventContext) => {
  return getOriginCache<DistributionDefaultOrigin>(state, service, 'default', service.defaultOrigin, options, context);
};

export const getAdditionalOriginCache = (state: EntryStates, service: CdnService, options: DeployOptions, context: EventContext) => {
  const { origins = [] } = service;

  return origins.map((origin, index) => {
    return getOriginCache<DistributionAdditionalOrigin>(state, service, `origin_${index + 1}`, origin, options, context);
  });
};

const getOriginCache = <T extends DistributionDefaultOrigin | DistributionAdditionalOrigin>(
  state: EntryStates,
  service: CdnService,
  id: string,
  origin: CdnOrigin,
  options: DeployOptions,
  eventContext: EventContext
) => {
  const { location, path, cache } = origin;

  const cacheState = createCachePolicy(state, {
    policyName: getCachePolicyName(service, origin, options),
    description: service.description,
    compress: cache?.compress ?? true,
    defaultTTL: cache?.ttl ?? 86400,
    maxTTL: cache?.maxTTL ?? 31536000,
    minTTL: cache?.minTTL ?? 0,
    cacheKeys: {
      headers: cache?.headers,
      cookies: cache?.cookies,
      queries: cache?.queries
    }
  });

  const isBucket = isCdnBucketOrigin(origin);

  const originData = isBucket
    ? {
        domain: getServiceName(origin.bucket, options)
      }
    : {
        http: origin.protocol === OriginProtocol.Http,
        headers: origin.headers,
        domain: origin.domain,
        port: origin.port
      };

  const originCache = {
    id,
    path,
    location,
    ...originData,
    getDistributionOrigin: async (stepContext) => {
      const originPolicyId = getOriginPolicyId(DistributionServiceName, cacheState.entryId, stepContext);
      const cachePolicyId = getCachePolicyId(DistributionServiceName, cacheState.entryId, stepContext);

      if (isBucket) {
        const bucketState = getBucketState(eventContext, origin.bucket, options);
        const bucketName = bucketState.parameters.bucketName;
        const bucketDomain = await getBucketDomain(bucketName);

        return {
          domain: bucketDomain,
          originPolicyId,
          cachePolicyId
        };
      }

      return {
        domain: origin.domain,
        originPolicyId,
        cachePolicyId
      };
    }
  } as T;

  return {
    origin: originCache,
    state: cacheState
  };
};
