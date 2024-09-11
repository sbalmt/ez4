import { registerProvider } from '@ez4/aws-common';

import { getRuleHandler } from './rule/handler.js';
import { RuleServiceType } from './rule/types.js';

import { getTargetHandler } from './target/handler.js';
import { TargetServiceType } from './target/types.js';

export * from './rule/service.js';
export * from './rule/types.js';
export * from './rule/utils.js';

export * from './target/function/service.js';
export * from './target/function/types.js';

export * from './target/service.js';
export * from './target/types.js';

export * from './triggers/register.js';

registerProvider(RuleServiceType, getRuleHandler());
registerProvider(TargetServiceType, getTargetHandler());
