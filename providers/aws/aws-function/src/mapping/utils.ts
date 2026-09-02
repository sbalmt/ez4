import type { EntryState } from '@ez4/state';
import type { MappingState } from './types';

import { MappingServiceType } from './types';

export const isMappingState = (resource: EntryState): resource is MappingState => {
  return resource.type === MappingServiceType;
};
