import type { BucketState } from '@ez4/aws-bucket';
import type { DistributionState } from '../distribution/types.js';

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

import { createAccess } from '../access/service.js';
import { createDistribution } from '../distribution/service.js';
import { getDistributionArn, getDistributionId } from '../distribution/utils.js';
import { getRoleDocument } from '../utils/role.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, defaultIndex, defaultOrigin, compress, disabled } = service;

  const bucketName = getServiceName(defaultOrigin.bucket, options);

  const distributionName = getServiceName(service, options);

  const accessState = createAccess(state, {
    accessName: distributionName,
    description
  });

  createDistribution(state, accessState, {
    enabled: !disabled,
    distributionName,
    defaultOrigin: {
      id: 'default',
      domain: await getBucketDomain(bucketName),
      path: defaultOrigin.originPath
    },
    defaultIndex,
    description,
    compress
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
      const distributionArn = getDistributionArn('ok', 'policy', context);
      const bucketName = getBucketName('ok', 'policy', context);

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
