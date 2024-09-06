import { registerTriggers } from '@ez4/aws-gateway';
import { destroy } from '@ez4/project';

import { config } from '../ez4.config.js';

registerTriggers();

await destroy(config);
