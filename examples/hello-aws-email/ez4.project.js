/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-email',
  sourceFiles: ['./src/api.ts'],
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
  tags: {
    Owner: 'EZ4 Examples'
  }
};
