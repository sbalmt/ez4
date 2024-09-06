import { registerTriggers } from '@ez4/aws-gateway';
import { deploy } from '@ez4/project';

import { config } from '../ez4.config.js';

registerTriggers();

await deploy(config);
