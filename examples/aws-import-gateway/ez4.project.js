/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'import-gateway',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  tags: {
    Owner: 'EZ4 Examples'
  },
  serveOptions: {
    localPort: 3735
  },
  importProjects: {
    'hello-aws-gateway': {
      projectFile: '../hello-aws-gateway/ez4.project.js'
    }
  }
};
