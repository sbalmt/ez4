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
  },
  localOptions: {
    db: {
      host: '127.0.0.1',
      port: 8000
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
