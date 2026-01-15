/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'import-topic',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  deployOptions: {
    tagName: 'ReleaseVersion',
    variableName: 'RELEASE_VERSION',
    version: '1.0.0'
  },
  serveOptions: {
    localPort: 3735
  },
  tags: {
    Owner: 'EZ4 Examples'
  },
  importProjects: {
    'hello-aws-topic': {
      projectFile: '../hello-aws-topic/ez4.project.js'
    }
  }
};
