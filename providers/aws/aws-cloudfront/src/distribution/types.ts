import type { EntryState, StepContext } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { AdditionalOrigin, CreateRequest, CreateResponse, DefaultOrigin } from './client';

export const DistributionServiceName = 'AWS:CloudFront/Distribution';

export const DistributionServiceType = 'aws:cloudfront.distribution';

type DistributionDefaultOriginParameters = Omit<DefaultOrigin, 'originPolicyId' | 'cachePolicyId'>;

type DistributionAdditionalOriginParameters = Omit<AdditionalOrigin, 'originPolicyId' | 'cachePolicyId'>;

export type DistributionOrigin = Pick<DefaultOrigin | AdditionalOrigin, 'domain' | 'originPolicyId' | 'cachePolicyId'>;

export type GetDistributionOrigin = (context: StepContext) => Promise<DistributionOrigin> | DistributionOrigin;

export type DistributionDefaultOrigin = DistributionDefaultOriginParameters & {
  getDistributionOrigin: GetDistributionOrigin;
};

export type DistributionAdditionalOrigin = DistributionAdditionalOriginParameters & {
  getDistributionOrigin: GetDistributionOrigin;
};

export type DistributionParameters = Omit<CreateRequest, 'originAccessId' | 'certificateArn' | 'defaultOrigin' | 'origins'> & {
  defaultOrigin: DistributionDefaultOrigin;
  origins?: DistributionAdditionalOrigin[];
};

export type DistributionResult = CreateResponse & {
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
