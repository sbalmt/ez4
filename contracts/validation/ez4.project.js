/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'validation',
  sourceFiles: ['./test/cases/circular-dependencies.ts', './test/cases/options-isolation.ts', './test/cases/client-mock.ts'],
  stateFile: {
    path: 'ez4-state'
  }
};
