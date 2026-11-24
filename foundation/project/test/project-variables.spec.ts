import type { LoadedProjectOptions } from '../src/config/project';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getDeployOptions } from '../src/deploy/options';
import { getServeOptions } from '../src/emulator/options';

const project: LoadedProjectOptions = {
  projectName: 'command-variables',
  projectPath: 'ez4.project.js',
  workspacePath: process.cwd(),
  sourceFiles: [],
  stateFile: {
    path: 'state'
  },
  variables: {
    SHARED: 'shared',
    OVERRIDDEN: 'root'
  },
  deployOptions: {
    variables: {
      DEPLOY: 'deploy',
      OVERRIDDEN: 'deploy'
    }
  },
  serveOptions: {
    variables: {
      SERVE: 'serve',
      OVERRIDDEN: 'serve'
    }
  }
};

describe('project command variables', () => {
  it('assert :: applies deploy variables only to deployment options', () => {
    deepEqual(getDeployOptions({}, project).variables, {
      SHARED: 'shared',
      OVERRIDDEN: 'deploy',
      DEPLOY: 'deploy'
    });
  });

  it('assert :: applies serve variables only to emulator options', () => {
    deepEqual(getServeOptions({}, project).variables, {
      SHARED: 'shared',
      OVERRIDDEN: 'serve',
      SERVE: 'serve'
    });
  });
});
