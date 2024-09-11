import type { Arn } from '@ez4/aws-common';
import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const TargetServiceName = 'AWS:EventBridge/Target';

export const TargetServiceType = 'aws:eventbridge.target';

export type TargetParameters = Omit<CreateRequest, 'functionArn'>;

export type TargetResult = CreateResponse & {
  ruleName: string;
  functionArn: Arn;
};

export type TargetState = EntryState & {
  type: typeof TargetServiceType;
  parameters: TargetParameters;
  result?: TargetResult;
};
