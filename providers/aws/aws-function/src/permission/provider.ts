import { tryRegisterProvider } from '@ez4/aws-common';

import { getPermissionHandler } from './handler';
import { PermissionServiceType } from './types';

export const registerPermissionProvider = () => {
  tryRegisterProvider(PermissionServiceType, getPermissionHandler());
};
