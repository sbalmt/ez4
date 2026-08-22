import type { EntryState } from '@ez4/state';
import type { IntegrityState } from './types';

import { IntegrityServiceType } from './types';

export const isIntegrityState = (resource: EntryState): resource is IntegrityState => {
  return resource.type === IntegrityServiceType;
};
