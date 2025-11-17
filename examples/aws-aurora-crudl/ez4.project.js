/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'aurora-crudl',
  sourceFiles: ['./src/api.ts', './src/aurora.ts'],
  stateFile: {
    path: 'ez4-deploy'
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
