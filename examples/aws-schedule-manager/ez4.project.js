/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: false,
  projectName: 'schedule-manager',
  sourceFiles: ['./src/api.ts', './src/dynamo.ts', './src/scheduler.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  deployOptions: {
    release: {
      tagName: 'ReleaseVersion',
      variableName: 'RELEASE_VERSION',
      version: '1.0.0'
    }
  },
  localOptions: {
    event_db: {
      host: '127.0.0.1',
      port: 8000
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
