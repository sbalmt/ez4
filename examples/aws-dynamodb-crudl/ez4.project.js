/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'aws-dynamodb',
  sourceFiles: ['./src/api.ts', './src/dynamo.ts'],
  stateFile: {
    path: 'ez4-deploy'
  }
};
