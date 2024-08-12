import { registerProvider } from '@ez4/aws-common';

import { getTableHandler } from './table/handler.js';
import { TableServiceType } from './table/types.js';

export * from './types/schema.js';

export * from './table/service.js';
export * from './table/types.js';

export * from './function/service.js';
export * from './function/types.js';

export * from './mapping/service.js';
export * from './mapping/types.js';

export * from './triggers/register.js';

registerProvider(TableServiceType, getTableHandler());
