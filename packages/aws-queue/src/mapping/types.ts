import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequestBase, CreateResponse, RequestForBatch } from './client.js';

export const MappingServiceName = 'AWS:SQS/Mapping';

export const MappingServiceType = 'aws:sqs.mapping';

export type MappingParametersBase = Omit<CreateRequestBase, 'functionName' | 'queueArn'>;
export type MappingParametersBatch = MappingParametersBase & RequestForBatch;
export type MappingParameters = MappingParametersBase | MappingParametersBatch;

export type MappingResult = CreateResponse & {
  functionName: string;
  queueArn: Arn;
};

export type MappingState = EntryState & {
  type: typeof MappingServiceType;
  parameters: MappingParameters;
  result?: MappingResult;
};
