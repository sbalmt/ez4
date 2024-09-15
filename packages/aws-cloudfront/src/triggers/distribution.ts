import type { BucketState } from '@ez4/aws-bucket';
import { DistributionServiceType, type DistributionState } from '../distribution/types.js';

import type {
  PrepareResourceEvent,
  ConnectResourceEvent,
  DeployOptions
} from '@ez4/project/library';

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import {
  createBucketObject,
  createBucketPolicy,
  getBucketDomain,
  getBucketId,
  getBucketName
} from '@ez4/aws-bucket';

import { EntryStates, getEntry, linkDependency } from '@ez4/stateful';
import { CdnService, isCdnService } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';

import { getRoleDocument } from '../utils/role.js';
import { createCachePolicy } from '../policy/service.js';
import { createOriginAccess } from '../access/service.js';
import { createDistribution } from '../distribution/service.js';
import { getDistributionArn, getDistributionId } from '../distribution/utils.js';
import { getCachePolicyName, getOriginAccessName } from './utils.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, compress, defaultOrigin } = service;

  const bucketName = getServiceName(defaultOrigin.bucket, options);

  const accessState = createOriginAccess(state, {
    accessName: getOriginAccessName(service, options),
    description
  });

  const policyState = createCachePolicy(state, {
    policyName: getCachePolicyName(service, options),
    defaultTTL: service.defaultTTL ?? 300,
    maxTTL: service.maxTTL ?? 86400,
    minTTL: service.minTTL ?? 1,
    description,
    compress
  });

  createDistribution(state, accessState, policyState, {
    distributionName: getServiceName(service, options),
    defaultIndex: service.defaultIndex,
    enabled: !service.disabled,
    description,
    compress,
    defaultOrigin: {
      id: 'default',
      domain: await getBucketDomain(bucketName),
      path: defaultOrigin.originPath
    }
  });
};

export const connectCdnServices = async (event: ConnectResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { defaultOrigin } = service;
  const { bucket, localPath } = defaultOrigin;

  const bucketName = getServiceName(bucket, options);
  const bucketId = getBucketId(bucketName);

  const bucketState = getEntry(state, bucketId) as BucketState;

  if (localPath) {
    await attachLocalPathObjects(state, bucketState, localPath);
  }

  attachDistributionBucket(state, service, bucketState, options);
};

const attachDistributionBucket = (
  state: EntryStates,
  service: CdnService,
  bucketState: BucketState,
  options: DeployOptions
) => {
  const distributionName = getServiceName(service, options);
  const distributionId = getDistributionId(distributionName);

  const distributionState = getEntry(state, distributionId) as DistributionState;

  linkDependency(state, distributionState.entryId, bucketState.entryId);

  createBucketPolicy(state, distributionState, bucketState, {
    getRole: async (context) => {
      const distributionArn = getDistributionArn(
        DistributionServiceType,
        distributionName,
        context
      );

      const bucketName = getBucketName(DistributionServiceType, distributionName, context);

      return getRoleDocument(distributionArn, bucketName);
    }
  });
};

const attachLocalPathObjects = async (
  state: EntryStates,
  bucketState: BucketState,
  localPath: string
) => {
  const basePath = join(process.cwd(), localPath);

  const files = await readdir(basePath, {
    withFileTypes: true,
    recursive: true
  });

  for (const file of files) {
    if (!file.isFile()) {
      continue;
    }

    const filePath = join(file.parentPath, file.name);
    const objectKey = relative(basePath, filePath);

    createBucketObject(state, bucketState, {
      objectKey,
      filePath
    });
  }
};
