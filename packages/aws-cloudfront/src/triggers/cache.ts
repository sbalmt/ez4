import type { EntryStates } from '@ez4/stateful';
import type { DeployOptions } from '@ez4/project/library';
import type { AdditionalOrigin, DefaultOrigin } from '../distribution/client.js';

import { getServiceName } from '@ez4/project/library';
import { CdnService, CdnOrigin, isCdnBucketOrigin } from '@ez4/distribution/library';
import { getBucketDomain } from '@ez4/aws-bucket';
import { OriginProtocol } from '@ez4/distribution';

import { createCachePolicy } from '../cache/service.js';
import { getCachePolicyName } from './utils.js';

export const getDefaultOriginCache = async (
  state: EntryStates,
  service: CdnService,
  options: DeployOptions
) => {
  return getOriginCache<DefaultOrigin>(state, service, 'default', service.defaultOrigin, options);
};

export const getAdditionalOriginCache = async (
  state: EntryStates,
  service: CdnService,
  options: DeployOptions
) => {
  const { origins } = service;

  if (!origins?.length) {
    return [];
  }

  const promises = origins.map((origin, index) =>
    getOriginCache<AdditionalOrigin>(state, service, `origin_${index + 1}`, origin, options)
  );

  return Promise.all(promises);
};

const getOriginCache = async <T extends DefaultOrigin | AdditionalOrigin>(
  state: EntryStates,
  service: CdnService,
  id: string,
  origin: CdnOrigin,
  options: DeployOptions
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
    ...(isCdnBucketOrigin(origin)
      ? {
          domain: await getBucketDomain(getServiceName(origin.bucket, options))
        }
      : {
          http: origin.protocol === OriginProtocol.Http,
          domain: origin.domain,
          headers: origin.headers,
          port: origin.port
        })
  } as T;
};
