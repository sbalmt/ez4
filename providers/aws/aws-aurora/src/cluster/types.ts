import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client.js';

export const ClusterServiceName = 'AWS:Aurora/Cluster';

export const ClusterServiceType = 'aws:aurora.cluster';

export type ClusterParameters = CreateRequest;

export type ClusterResult = ImportOrCreateResponse;

export type ClusterState = EntryState & {
  type: typeof ClusterServiceType;
  parameters: ClusterParameters;
  result?: ClusterResult;
};
