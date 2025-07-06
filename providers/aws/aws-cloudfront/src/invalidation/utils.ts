import type { EntryState } from '@ez4/stateful';
import type { InvalidationState } from './types.js';

import { InvalidationServiceType } from './types.js';

export const isInvalidationState = (resource: EntryState): resource is InvalidationState => {
  return resource.type === InvalidationServiceType;
};
