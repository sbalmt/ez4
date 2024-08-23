import { deploy } from '@ez4/project';

import { registerTriggers as registerGatewayTriggers } from '@ez4/aws-gateway';

registerGatewayTriggers();

await deploy({
  projectName: 'aws-api-authorizer-example',
  resourcePrefix: 'ez4',
  stateFile: `ez4-deploy`,
  sourceFiles: ['./src/service.ts']
});
