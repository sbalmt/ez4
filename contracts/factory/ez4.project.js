/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'factory',
  sourceFiles: ['./test/input/circular-dependencies.ts', './test/input/global-instance.ts'],
  stateFile: {
    path: 'ez4-state'
  }
};
