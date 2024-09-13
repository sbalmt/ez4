import { registerProvider } from '@ez4/aws-common';

import { getBucketHandler } from './bucket/handler.js';
import { getObjectHandler } from './object/handler.js';

import { BucketServiceType } from './bucket/types.js';
import { ObjectServiceType } from './object/types.js';

export * from './bucket/service.js';
export * from './bucket/types.js';

export * from './object/service.js';
export * from './object/types.js';

export * from './triggers/register.js';

registerProvider(BucketServiceType, getBucketHandler());
registerProvider(ObjectServiceType, getObjectHandler());
