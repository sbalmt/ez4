import { tryRegisterProvider } from '@ez4/aws-common';

import { getRoleHandler } from './handler';
import { RoleServiceType } from './types';

export const registerRoleProvider = () => {
  tryRegisterProvider(RoleServiceType, getRoleHandler());
};
