/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: false,
  projectName: 'hello-queue',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
