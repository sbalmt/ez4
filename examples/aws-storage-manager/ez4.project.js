/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: false,
  projectName: 'storage-manager',
  sourceFiles: ['./src/api.ts', './src/dynamo.ts', './src/storage.ts'],
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
    file_db: {
      host: '127.0.0.1',
      port: 8000
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
