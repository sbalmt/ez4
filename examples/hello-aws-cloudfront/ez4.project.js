/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-cloudfront',
  sourceFiles: ['./src/distribution.ts', './src/storage.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  deployOptions: {
    tagName: 'ReleaseVersion',
    variableName: 'RELEASE_VERSION',
    version: '1.0.0'
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
