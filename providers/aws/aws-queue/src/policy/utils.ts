import type { EntryState } from '@ez4/stateful';
import type { QueuePolicyState } from './types';

import { QueuePolicyServiceType } from './types';

export const isQueuePolicyState = (resource: EntryState): resource is QueuePolicyState => {
  return resource.type === QueuePolicyServiceType;
};
