import { registerProvider } from '@ez4/aws-common';

import { getPermissionHandler } from './handler';
import { PermissionServiceType } from './types';

export const registerPermissionProvider = () => {
  registerProvider(PermissionServiceType, getPermissionHandler());
};
