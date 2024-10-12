import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const ClusterServiceName = 'AWS:Aurora/Cluster';

export const ClusterServiceType = 'aws:aurora.cluster';

export type ClusterParameters = CreateRequest;

export type ClusterResult = CreateResponse;

export type ClusterState = EntryState & {
  type: typeof ClusterServiceType;
  parameters: ClusterParameters;
  result?: ClusterResult;
};
