import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const InstanceServiceName = 'AWS:Aurora/Instance';

export const InstanceServiceType = 'aws:aurora.instance';

export type InstanceParameters = Omit<CreateRequest, 'clusterName'>;

export type InstanceResult = ImportOrCreateResponse & {
  clusterName: string;
};

export type InstanceState = EntryState & {
  type: typeof InstanceServiceType;
  parameters: InstanceParameters;
  result?: InstanceResult;
};
