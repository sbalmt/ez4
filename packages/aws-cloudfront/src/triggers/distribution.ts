import type { BucketState } from '@ez4/aws-bucket';
import type { DistributionState } from '../distribution/types.js';

import type {
  PrepareResourceEvent,
  ConnectResourceEvent,
  DeployOptions
} from '@ez4/project/library';

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { createBucketObject, getBucketDomain, getBucketId } from '@ez4/aws-bucket';
import { CdnService, isCdnService } from '@ez4/distribution/library';
import { EntryStates, linkDependency } from '@ez4/stateful';
import { getServiceName } from '@ez4/project/library';

import { createDistribution } from '../distribution/service.js';
import { getDistributionId } from '../distribution/utils.js';

export const prepareCdnServices = async (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isCdnService(service)) {
    return;
  }

  const { description, defaultIndex, defaultOrigin, compress, disabled } = service;

  const bucketName = getServiceName(defaultOrigin.bucket, options);

  createDistribution(state, {
    distributionName: getServiceName(service, options),
    enabled: !disabled,
    defaultOrigin: {
      id: 'default',
      domainName: await getBucketDomain(bucketName),
      originPath: defaultOrigin.originPath
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

  const bucketState = state[bucketId] as BucketState;

  if (localPath) {
    await attachLocalPathObjects(state, bucketState, localPath);
  }

  attachDistributionBucket(state, service, bucketState, options);
};

const attachDistributionBucket = (
  state: EntryStates,
  service: CdnService,
  bucket: BucketState,
  options: DeployOptions
) => {
  const distributionName = getServiceName(service, options);
  const distributionId = getDistributionId(distributionName);

  const distributionState = state[distributionId] as DistributionState;

  linkDependency(state, distributionState.entryId, bucket.entryId);
};

const attachLocalPathObjects = async (
  state: EntryStates,
  bucket: BucketState,
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

    createBucketObject(state, bucket, {
      objectKey,
      filePath
    });
  }
};
