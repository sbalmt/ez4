import type { EntryStates } from '@ez4/stateful';
import type { DeployOptions } from '@ez4/project/library';
import type { AdditionalOrigin, DefaultOrigin } from '../distribution/client.js';

import { getBucketDomain } from '@ez4/aws-bucket';
import { CdnService, CdnOrigin, isCdnBucketOrigin } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';
import { OriginProtocol } from '@ez4/distribution';

import { createCachePolicy } from '../cache/service.js';
import { getCachePolicyName } from './utils.js';

export const getDefaultOrigin = async (
  state: EntryStates,
  service: CdnService,
  options: DeployOptions
) => {
  return getOrigin<DefaultOrigin>(state, service, 'default', service.defaultOrigin, options);
};

export const getAdditionalOrigins = async (
  state: EntryStates,
  service: CdnService,
  options: DeployOptions
) => {
  const { origins } = service;

  if (!origins?.length) {
    return [];
  }

  return Promise.all(
    origins?.map((origin, index) => {
      return getOrigin<AdditionalOrigin>(state, service, `origin_${index + 1}`, origin, options);
    })
  );
};

const getOriginCache = (
  state: EntryStates,
  service: CdnService,
  origin: CdnOrigin,
  options: DeployOptions
) => {
  const { cache } = origin;

  return createCachePolicy(state, {
    policyName: getCachePolicyName(service, origin, options),
    description: service.description,
    compress: cache?.compress ?? true,
    defaultTTL: cache?.ttl ?? 86400,
    maxTTL: cache?.maxTTL ?? 31536000,
    minTTL: cache?.minTTL ?? 0
  });
};

const getOrigin = async <T extends DefaultOrigin | AdditionalOrigin>(
  state: EntryStates,
  service: CdnService,
  id: string,
  origin: CdnOrigin,
  options: DeployOptions
) => {
  const { location, path } = origin;

  const originCache = getOriginCache(state, service, origin, options);

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
