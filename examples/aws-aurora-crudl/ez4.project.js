/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'aws-aurora',
  sourceFiles: ['./src/api.ts', './src/aurora.ts'],
  stateFile: {
    path: 'ez4-deploy'
  }
};
