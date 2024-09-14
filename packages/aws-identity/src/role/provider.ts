import { registerProvider } from '@ez4/aws-common';

import { getRoleHandler } from './handler.js';
import { RoleServiceType } from './types.js';

export const registerRoleProvider = () => {
  registerProvider(RoleServiceType, getRoleHandler());
};
