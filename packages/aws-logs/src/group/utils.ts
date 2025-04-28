import type { EntryState } from '@ez4/stateful';
import type { LogGroupState } from './types.js';

import { LogGroupServiceType } from './types.js';

export const isLogGroupState = (resource: EntryState): resource is LogGroupState => {
  return resource.type === LogGroupServiceType;
};
