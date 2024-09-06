import { registerTriggers } from '@ez4/aws-dynamodb';
import { deploy } from '@ez4/project';

import { config } from '../ez4.config.js';

registerTriggers();

await deploy(config);
