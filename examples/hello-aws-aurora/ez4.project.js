/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-aurora',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  localOptions: {
    db: {
      user: 'postgres',
      password: 'postgres',
      host: '127.0.0.1',
      port: 5432
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
