/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-dynamodb',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  deployOptions: {
    tagName: 'ReleaseVersion',
    variableName: 'RELEASE_VERSION',
    version: '1.0.0'
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
