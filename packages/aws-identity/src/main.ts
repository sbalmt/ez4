import { registerProvider } from '@ez4/aws-common';

import { getRoleHandler } from './role/handler.js';
import { RoleServiceType } from './role/types.js';

import { getPolicyHandler } from './policy/handler.js';
import { PolicyServiceType } from './policy/types.js';

export * from './types/role.js';
export * from './types/policy.js';

export * from './role/service.js';
export * from './role/types.js';
export * from './role/utils.js';

export * from './policy/service.js';
export * from './policy/types.js';

export * from './utils/account.js';
export * from './utils/policy.js';
export * from './utils/role.js';

export * from './triggers/register.js';

registerProvider(RoleServiceType, getRoleHandler());
registerProvider(PolicyServiceType, getPolicyHandler());
