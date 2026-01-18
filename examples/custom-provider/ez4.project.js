/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'use-custom-provider',
  sourceFiles: ['./src/service.ts'],
  customProviders: {
    packages: ['custom-provider']
  },
  stateFile: {
    path: 'ez4-deploy'
  },
  deployOptions: {
    release: {
      tagName: 'ReleaseVersion',
      variableName: 'RELEASE_VERSION',
      version: '1.0.0'
    }
  }
};
