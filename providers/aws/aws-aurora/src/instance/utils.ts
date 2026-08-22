import type { EntryState } from '@ez4/state';
import type { InstanceState } from './types';

import { InstanceServiceType } from './types';

export const isInstanceState = (resource: EntryState): resource is InstanceState => {
  return resource.type === InstanceServiceType;
};
