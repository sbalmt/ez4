/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'schedule-manager',
  sourceFiles: ['./src/api.ts', './src/dynamo.ts', './src/scheduler.ts'],
  stateFile: {
    path: 'ez4-deploy'
  }
};
