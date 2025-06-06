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
  tags: {
    Owner: 'EZ4 Examples'
  }
};
