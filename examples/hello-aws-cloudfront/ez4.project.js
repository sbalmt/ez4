/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'aws-cloudfront',
  sourceFiles: ['./src/distribution.ts'],
  stateFile: {
    path: 'ez4-deploy'
  }
};
