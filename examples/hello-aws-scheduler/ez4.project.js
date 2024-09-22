/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'aws-scheduler',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  }
};
