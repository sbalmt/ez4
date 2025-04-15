import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';

import { CdnService, CdnOrigin, isCdnBucketOrigin } from '@ez4/distribution/library';
import { getBucketDomain, getBucketState } from '@ez4/aws-bucket';
import { getServiceName } from '@ez4/project/library';
import { OriginProtocol } from '@ez4/distribution';

import { DistributionAdditionalOrigin, DistributionDefaultOrigin } from '../distribution/types.js';
import { createCachePolicy } from '../cache/service.js';
import { getCachePolicyName } from './utils.js';

export const getDefaultOriginCache = async (state: EntryStates, service: CdnService, options: DeployOptions, context: EventContext) => {
  return getOriginCache<DistributionDefaultOrigin>(state, service, 'default', service.defaultOrigin, options, context);
};

export const getAdditionalOriginCache = async (state: EntryStates, service: CdnService, options: DeployOptions, context: EventContext) => {
  const { origins = [] } = service;

  const additionalOrigins = await Promise.all(
    origins.map((origin, index) => {
      return getOriginCache<DistributionAdditionalOrigin>(state, service, `origin_${index + 1}`, origin, options, context);
    })
  );

  // Ensure same position to not trigger updates without real changes.
  additionalOrigins.sort((a, b) => a.id.localeCompare(b.id));

  return additionalOrigins;
};

const getOriginCache = async <T extends DistributionDefaultOrigin | DistributionAdditionalOrigin>(
  state: EntryStates,
  service: CdnService,
  id: string,
  origin: CdnOrigin,
  options: DeployOptions,
  context: EventContext
) => {
  const { location, path, cache } = origin;

  const originCache = createCachePolicy(state, {
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

  return {
    id,
    path,
    location,
    cachePolicyId: originCache.entryId,
    ...(isBucket
      ? {
          domain: getServiceName(origin.bucket, options)
        }
      : {
          http: origin.protocol === OriginProtocol.Http,
          headers: origin.headers,
          domain: origin.domain,
          port: origin.port
        }),
    getDistributionOrigin: async () => {
      if (isBucket) {
        const bucketState = getBucketState(context, origin.bucket, options);
        const bucketName = bucketState.parameters.bucketName;
        const bucketDomain = await getBucketDomain(bucketName);

        return {
          domain: bucketDomain
        };
      }

      return {
        domain: origin.domain
      };
    }
  } as T;
};
