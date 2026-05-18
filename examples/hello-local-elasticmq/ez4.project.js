/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-local-elasticmq',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  localOptions: {
    queue: {
      host: 'localhost',
      port: 9324
    }
  },
  testOptions: {
    queue: {
      host: 'localhost',
      port: 9324
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
