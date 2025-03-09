import type { DeployOptions, ResourceEventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';

import { CdnService, CdnOrigin, isCdnBucketOrigin } from '@ez4/distribution/library';
import { getBucketDomain, getBucketState } from '@ez4/aws-bucket';
import { OriginProtocol } from '@ez4/distribution';

import { DistributionAdditionalOrigin, DistributionDefaultOrigin } from '../distribution/types.js';
import { createCachePolicy } from '../cache/service.js';
import { getCachePolicyName } from './utils.js';

export const getDefaultOriginCache = async (
  state: EntryStates,
  service: CdnService,
  options: DeployOptions,
  context: ResourceEventContext
) => {
  return getOriginCache<DistributionDefaultOrigin>(state, service, 'default', service.defaultOrigin, options, context);
};

export const getAdditionalOriginCache = async (
  state: EntryStates,
  service: CdnService,
  options: DeployOptions,
  context: ResourceEventContext
) => {
  const { origins } = service;

  if (!origins?.length) {
    return [];
  }

  const promises = origins.map((origin, index) =>
    getOriginCache<DistributionAdditionalOrigin>(state, service, `origin_${index + 1}`, origin, options, context)
  );

  return Promise.all(promises);
};

const getOriginCache = async <T extends DistributionDefaultOrigin | DistributionAdditionalOrigin>(
  state: EntryStates,
  service: CdnService,
  id: string,
  origin: CdnOrigin,
  options: DeployOptions,
  context: ResourceEventContext
) => {
  const { location, path, cache } = origin;

  const originCache = createCachePolicy(state, {
    policyName: getCachePolicyName(service, origin, options),
    description: service.description,
    compress: cache?.compress ?? true,
    defaultTTL: cache?.ttl ?? 86400,
    maxTTL: cache?.maxTTL ?? 31536000,
    minTTL: cache?.minTTL ?? 0
  });

  return {
    id,
    path,
    location,
    cachePolicyId: originCache.entryId,
    getDistributionOrigin: async () => {
      if (isCdnBucketOrigin(origin)) {
        const bucketState = getBucketState(context, origin.bucket, options);
        const bucketName = bucketState.parameters.bucketName;
        const bucketDomain = await getBucketDomain(bucketName);

        return {
          domain: bucketDomain
        };
      }

      return {
        http: origin.protocol === OriginProtocol.Http,
        domain: origin.domain,
        headers: origin.headers,
        port: origin.port
      };
    }
  } as T;
};
