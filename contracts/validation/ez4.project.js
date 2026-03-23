/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'validation',
  sourceFiles: ['./test/input/circular-dependencies.ts'],
  stateFile: {
    path: 'ez4-state'
  }
};
