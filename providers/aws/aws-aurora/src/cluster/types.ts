import type { EntryState } from '@ez4/state';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const ClusterServiceName = 'AWS:Aurora/Cluster';

export const ClusterServiceType = 'aws:aurora.cluster';

export type ClusterParameters = CreateRequest & {
  branchMode?: boolean;
};

export type ClusterResult = ImportOrCreateResponse;

export type ClusterState = EntryState & {
  type: typeof ClusterServiceType;
  parameters: ClusterParameters;
  result?: ClusterResult;
};
