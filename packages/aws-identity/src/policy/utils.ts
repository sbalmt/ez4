import type { EntryState } from '@ez4/stateful';
import type { PolicyState } from './types.js';

import { PolicyServiceType } from './types.js';

export const isPolicyState = (resource: EntryState): resource is PolicyState => {
  return resource.type === PolicyServiceType;
};
