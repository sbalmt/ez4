/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'dynamodb-crudl',
  sourceFiles: ['./src/api.ts', './src/dynamo.ts'],
  stateFile: {
    path: 'ez4-deploy'
  }
};
