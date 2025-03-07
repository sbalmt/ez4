import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { AdditionalOrigin, CreateRequest, CreateResponse, DefaultOrigin } from './client.js';

export const DistributionServiceName = 'AWS:CloudFront/Distribution';

export const DistributionServiceType = 'aws:cloudfront.distribution';

export type DistributionOriginParameters = Pick<DefaultOrigin, 'id' | 'location' | 'cachePolicyId'>;

export type DistributionOrigin = Omit<DefaultOrigin, keyof DistributionOriginParameters>;

export type GetDistributionOrigin = (
  context?: StepContext
) => Promise<DistributionOrigin> | DistributionOrigin;

export type DistributionDefaultOrigin = DistributionOriginParameters & {
  getDistributionOrigin: GetDistributionOrigin;
};

export type DistributionAdditionalOrigin = DistributionOriginParameters &
  Pick<AdditionalOrigin, 'path'> & {
    getDistributionOrigin: GetDistributionOrigin;
  };

export type DistributionParameters = Omit<
  CreateRequest,
  'originAccessId' | 'certificateArn' | 'defaultOrigin' | 'origins'
> & {
  defaultOrigin: DistributionDefaultOrigin;
  origins?: DistributionAdditionalOrigin[];
};

export type DistributionResult = CreateResponse & {
  cachePolicyIds: string[];
  originPolicyId: string;
  originAccessId: string;
  certificateArn: Arn | undefined;
  defaultOrigin: DistributionOrigin;
  origins: DistributionOrigin[];
};

export type DistributionState = EntryState & {
  type: typeof DistributionServiceType;
  parameters: DistributionParameters;
  result?: DistributionResult;
};
