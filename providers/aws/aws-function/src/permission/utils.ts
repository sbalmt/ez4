import type { EntryState } from '@ez4/stateful';
import type { PermissionState } from './types';

import { PermissionServiceType } from './types';

export const isPermissionState = (resource: EntryState): resource is PermissionState => {
  return resource.type === PermissionServiceType;
};
