import { registerTriggers } from '@ez4/aws-queue';
import { deploy } from '@ez4/project';

import { config } from '../ez4.config.js';

registerTriggers();

await deploy(config);
