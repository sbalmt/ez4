import { deploy } from '@ez4/project';

import { registerTriggers as registerDynamoDbTriggers } from '@ez4/aws-dynamodb';

registerDynamoDbTriggers();

await deploy({
  projectName: 'aws-dynamodb-example',
  resourcePrefix: 'ez4',
  stateFile: `ez4-deploy`,
  sourceFiles: ['./src/service.ts']
});
