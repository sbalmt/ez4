import { deploy } from '@ez4/project';

import { registerTriggers as registerQueueTriggers } from '@ez4/aws-queue';

registerQueueTriggers();

await deploy({
  projectName: 'aws-sqs-example',
  resourcePrefix: 'ez4',
  stateFile: `ez4-deploy`,
  sourceFiles: ['./src/service.ts']
});
