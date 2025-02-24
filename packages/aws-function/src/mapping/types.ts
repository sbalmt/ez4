import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const MappingServiceName = 'AWS:Lambda/Mapping';

export const MappingServiceType = 'aws:lambda.mapping';

export type GetMappingSourceArn = (context: StepContext) => Promise<Arn> | Arn;

export type MappingParameters = Omit<CreateRequest, 'functionName' | 'sourceArn'> & {
  getSourceArn: GetMappingSourceArn;
};

export type MappingResult = ImportOrCreateResponse & {
  functionName: string;
  sourceArn: Arn;
};

export type MappingState = EntryState & {
  type: typeof MappingServiceType;
  parameters: MappingParameters;
  result?: MappingResult;
};
