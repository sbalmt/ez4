import { registerProvider } from '@ez4/aws-common';

import { getPermissionHandler } from './handler.js';
import { PermissionServiceType } from './types.js';

export const registerPermissionProvider = () => {
  registerProvider(PermissionServiceType, getPermissionHandler());
};
