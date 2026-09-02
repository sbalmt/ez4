import type { EntryState } from '@ez4/state';
import type { InvalidationState } from './types';

import { InvalidationServiceType } from './types';

export const isInvalidationState = (resource: EntryState): resource is InvalidationState => {
  return resource.type === InvalidationServiceType;
};
