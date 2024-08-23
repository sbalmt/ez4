import { destroy } from '@ez4/project';

import { registerTriggers as registerDynamoDbTriggers } from '@ez4/aws-dynamodb';

registerDynamoDbTriggers();

await destroy({
  projectName: 'aws-dynamodb-stream-example',
  resourcePrefix: 'ez4',
  stateFile: `ez4-deploy`,
  sourceFiles: ['./src/service.ts']
});
