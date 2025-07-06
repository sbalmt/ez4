import type { EntryState } from '@ez4/stateful';
import type { InstanceState } from './types.js';

import { InstanceServiceType } from './types.js';

export const isInstanceState = (resource: EntryState): resource is InstanceState => {
  return resource.type === InstanceServiceType;
};
