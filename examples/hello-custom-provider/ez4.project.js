/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'hello-custom-provider',
  sourceFiles: ['./src/service.ts'],
  customProviders: {
    packages: ['hello-custom-provider']
  },
  stateFile: {
    path: 'ez4-deploy'
  }
};
