import type { EntryState } from '@ez4/stateful';
import type { GroupState } from './types.js';

import { GroupServiceType } from './types.js';

export const isGroupState = (resource: EntryState): resource is GroupState => {
  return resource.type === GroupServiceType;
};
