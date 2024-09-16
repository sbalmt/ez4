import type { EntryState } from '@ez4/stateful';
import type { PermissionState } from './types.js';

import { PermissionServiceType } from './types.js';

export const isPermissionState = (resource: EntryState): resource is PermissionState => {
  return resource.type === PermissionServiceType;
};
