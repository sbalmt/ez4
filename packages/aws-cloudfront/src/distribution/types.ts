import type { EntryState, StepContext } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { AdditionalOrigin, CreateRequest, CreateResponse, DefaultOrigin } from './client.js';

export const DistributionServiceName = 'AWS:CloudFront/Distribution';

export const DistributionServiceType = 'aws:cloudfront.distribution';

export type DistributionDefaultOriginParameters = Omit<DefaultOrigin, 'originPolicyId'>;

export type DistributionAdditionalOriginParameters = Omit<AdditionalOrigin, 'originPolicyId'>;

export type DistributionOrigin = Pick<DefaultOrigin | AdditionalOrigin, 'domain'>;

export type GetDistributionOrigin = (context?: StepContext) => Promise<DistributionOrigin> | DistributionOrigin;

export type DistributionDefaultOrigin = DistributionDefaultOriginParameters & {
  getDistributionOrigin: GetDistributionOrigin;
  fromService: string;
};

export type DistributionAdditionalOrigin = DistributionAdditionalOriginParameters & {
  getDistributionOrigin: GetDistributionOrigin;
};

export type DistributionParameters = Omit<CreateRequest, 'originAccessId' | 'certificateArn' | 'defaultOrigin' | 'origins'> & {
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
