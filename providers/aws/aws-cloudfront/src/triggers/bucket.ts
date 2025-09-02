import type { CdnService } from '@ez4/distribution/library';
import type { DeployOptions } from '@ez4/project/library';
import type { BucketState } from '@ez4/aws-bucket';
import type { EntryStates } from '@ez4/stateful';

import { createBucketPolicy, getBucketName } from '@ez4/aws-bucket';
import { getServiceName } from '@ez4/project/library';
import { linkDependency } from '@ez4/stateful';

import { getDistributionArn, getDistributionState } from '../distribution/utils';
import { DistributionServiceType } from '../distribution/types';
import { getRoleDocument } from './role';

export const connectOriginBucket = (state: EntryStates, service: CdnService, bucketState: BucketState, options: DeployOptions) => {
  const distributionName = getServiceName(service, options);
  const distributionState = getDistributionState(state, distributionName);

  linkDependency(state, distributionState.entryId, bucketState.entryId);

  createBucketPolicy(state, distributionState, bucketState, {
    fromService: distributionName,
    getRole: async (context) => {
      const distributionArn = getDistributionArn(DistributionServiceType, distributionName, context);
      const bucketName = getBucketName(DistributionServiceType, distributionName, context);

      return getRoleDocument(distributionArn, bucketName);
    }
  });
};
