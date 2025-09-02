import type { EntryState } from '@ez4/stateful';
import type { PolicyState } from './types';

import { PolicyServiceType } from './types';

export const isBucketPolicyState = (resource: EntryState): resource is PolicyState => {
  return resource.type === PolicyServiceType;
};
