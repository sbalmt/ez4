import type { DeployOptions } from '@ez4/project/library';
import type { BucketState } from '@ez4/aws-bucket';

import { createBucketPolicy, getBucketName } from '@ez4/aws-bucket';

import { EntryStates, linkDependency } from '@ez4/stateful';
import { CdnService } from '@ez4/distribution/library';
import { getServiceName } from '@ez4/project/library';

import { getDistributionArn, getDistributionState } from '../distribution/utils.js';
import { DistributionServiceType } from '../distribution/types.js';
import { getRoleDocument } from './role.js';

export const connectOriginBucket = (
  state: EntryStates,
  service: CdnService,
  bucketState: BucketState,
  options: DeployOptions
) => {
  const distributionName = getServiceName(service, options);

  const distributionState = getDistributionState(state, distributionName);

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

  return distributionState;
};
