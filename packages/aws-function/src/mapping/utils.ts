import type { EntryState } from '@ez4/stateful';
import type { MappingState } from './types.js';

import { MappingServiceType } from './types.js';

export const isMappingState = (resource: EntryState): resource is MappingState => {
  return resource.type === MappingServiceType;
};
