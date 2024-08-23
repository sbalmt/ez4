import { destroy } from '@ez4/project';

import { registerTriggers as registerQueueTriggers } from '@ez4/aws-queue';

registerQueueTriggers();

await destroy({
  projectName: 'aws-sqs-example',
  resourcePrefix: 'ez4',
  stateFile: `ez4-deploy`,
  sourceFiles: ['./src/service.ts']
});
