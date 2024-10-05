import type { AdditionalOrigin, DefaultOrigin } from '../distribution/client.js';

import type {
  PrepareResourceEvent,
  ConnectResourceEvent,
  DeployOptions
} from '@ez4/project/library';

import { CdnOrigin, CdnService, isCdnBucketOrigin, isCdnService } from '@ez4/distribution/library';
import { getBucketDomain, getBucketState } from '@ez4/aws-bucket';
import { getServiceName } from '@ez4/project/library';
import { OriginProtocol } from '@ez4/distribution';

import { createCachePolicy } from '../policy/service.js';
import { createOriginAccess } from '../access/service.js';
import { createDistribution } from '../distribution/service.js';
import { getDistributionState } from '../distribution/utils.js';
import { createInvalidation } from '../invalidation/service.js';
import { getCachePolicyName, getOriginAccessName, getContentVersion } from './utils.js';
import { connectOriginBucket } from './bucket.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, defaultIndex, compress = true } = service;

  const originAccessState = createOriginAccess(state, {
    accessName: getOriginAccessName(service, options),
    description
  });

  const defaultTTL = service.cacheTTL ?? 86400;

  const cachePolicyState = createCachePolicy(state, {
    policyName: getCachePolicyName(service, options),
    maxTTL: service.maxCacheTTL ?? 31536000,
    minTTL: service.minCacheTTL ?? 0,
    defaultTTL,
    description,
    compress
  });

  const customErrors = service.fallbacks?.map(({ code, location, ttl }) => ({
    ttl: ttl ?? defaultTTL,
    location,
    code
  }));

  createDistribution(state, originAccessState, cachePolicyState, {
    distributionName: getServiceName(service, options),
    defaultOrigin: await getDefaultOrigin(service, options),
    origins: await getAdditionalOrigins(service, options),
    enabled: !service.disabled,
    aliases: service.aliases,
    defaultIndex,
    customErrors,
    description,
    compress
  });
};

export const connectCdnServices = async (event: ConnectResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const distributionName = getServiceName(service, options);
  const distributionState = getDistributionState(state, distributionName);

  const contentVersions: string[] = [];

  const allOrigins = service.additionalOrigins
    ? [service.defaultOrigin, ...service.additionalOrigins]
    : [service.defaultOrigin];

  for (const origin of allOrigins) {
    if (!isCdnBucketOrigin(origin)) {
      continue;
    }

    const bucketName = getServiceName(origin.bucket, options);
    const bucketState = getBucketState(state, bucketName);

    connectOriginBucket(state, service, bucketState, options);

    const { localPath } = bucketState.parameters;

    if (localPath) {
      const version = await getContentVersion(localPath);

      contentVersions.push(version);
    }
  }

  if (contentVersions.length > 0) {
    createInvalidation(state, distributionState, {
      contentVersion: contentVersions.join(',')
    });
  }
};

const getOrigin = async <T extends DefaultOrigin | AdditionalOrigin>(
  id: string,
  origin: CdnOrigin,
  options: DeployOptions
) => {
  const { location, path } = origin;

  return {
    id,
    location,
    path,
    ...(isCdnBucketOrigin(origin)
      ? {
          domain: await getBucketDomain(getServiceName(origin.bucket, options))
        }
      : {
          http: origin.protocol === OriginProtocol.Http,
          domain: origin.domain,
          port: origin.port
        })
  } as T;
};

const getDefaultOrigin = async (service: CdnService, options: DeployOptions) => {
  return getOrigin<DefaultOrigin>('default', service.defaultOrigin, options);
};

const getAdditionalOrigins = async (service: CdnService, options: DeployOptions) => {
  const { additionalOrigins } = service;

  if (!additionalOrigins?.length) {
    return [];
  }

  return Promise.all(
    additionalOrigins?.map((origin, index) => {
      return getOrigin<AdditionalOrigin>(`additional_${index + 1}`, origin, options);
    })
  );
};
