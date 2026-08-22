import type { EntryState } from '@ez4/state';
import type { LogPolicyState } from './types';

import { LogPolicyServiceType } from './types';

export const isLogPolicyState = (resource: EntryState): resource is LogPolicyState => {
  return resource.type === LogPolicyServiceType;
};
