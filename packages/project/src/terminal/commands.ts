import type { InputOptions } from './options.js';

import { loadEnvFile } from 'node:process';

import { loadProject } from '../services/project.js';
import { destroy } from '../services/destroy.js';
import { deploy } from '../services/deploy.js';
import { CommandType } from './options.js';

export const runActionCommand = async (options: InputOptions) => {
  if (options.environmentFile) {
    loadEnvFile(options.environmentFile);
  }

  const project = await loadProject(options.projectFile);

  project.debugMode = options.debugMode ?? project.debugMode;
  project.forceMode = options.forceMode ?? project.forceMode;

  if (options.command === CommandType.Deploy) {
    return deploy(project);
  }

  if (options.command === CommandType.Destroy) {
    return destroy(project);
  }
};

export const runHelpCommand = () => {
  const { stdout } = process;

  const helpText = [
    'Usage:',
    '  ez4 [command] [options] [ ez4.project.js ]',
    '',
    'Commands:',
    '  deploy   Create and publish all resources for the given project',
    '  destroy  Remove all deployed resources for the given project',
    '  help     Display the command line options',
    '',
    'Options:',
    '  --environment, -e  Specify the environment file',
    '  --project, -p      Specify the project file (Default is ez4.project.js)',
    '  --debug            Enable debug mode on deployed resources',
    '  --force            Force deploy of everything',
    ''
  ];

  stdout.write(helpText.join('\n'));
};
