import type { EntryState } from '@ez4/stateful';
import type { QueuePolicyState } from './types.js';

import { QueuePolicyServiceType } from './types.js';

export const isQueuePolicyState = (resource: EntryState): resource is QueuePolicyState => {
  return resource.type === QueuePolicyServiceType;
};
