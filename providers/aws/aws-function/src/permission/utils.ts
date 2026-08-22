import type { EntryState } from '@ez4/state';
import type { PermissionState } from './types';

import { PermissionServiceType } from './types';

export const isPermissionState = (resource: EntryState): resource is PermissionState => {
  return resource.type === PermissionServiceType;
};
