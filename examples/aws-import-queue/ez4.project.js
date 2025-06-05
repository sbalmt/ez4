/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'import-queue',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  tags: {
    Owner: 'EZ4 Examples'
  },
  importProjects: {
    'hello-aws-queue': {
      projectFile: '../hello-aws-queue/ez4.project.js'
    }
  }
};
