/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'aurora-crudl',
  sourceFiles: ['./src/*.ts'],
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
    db: {
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.0',
      port: 5432
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
