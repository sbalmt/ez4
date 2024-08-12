import { registerProvider } from '@ez4/aws-common';

import { getFunctionHandler } from './function/handler.js';
import { FunctionServiceType } from './function/types.js';

import { getPermissionHandler } from './permission/handler.js';
import { PermissionServiceType } from './permission/types.js';

import { getMappingHandler } from './mapping/handler.js';
import { MappingServiceType } from './mapping/types.js';

export * from './types/variables.js';

export * from './function/service.js';
export * from './function/types.js';
export * from './function/utils.js';

export * from './permission/service.js';
export * from './permission/types.js';

export * from './mapping/service.js';
export * from './mapping/types.js';

export * from './triggers/register.js';

registerProvider(FunctionServiceType, getFunctionHandler());
registerProvider(PermissionServiceType, getPermissionHandler());
registerProvider(MappingServiceType, getMappingHandler());
