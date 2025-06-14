#!/usr/bin/env node

import { loadEnvFile } from 'node:process';

import { toRed } from './console/format.js';
import { loadProject } from './services/project.js';
import { destroy } from './services/destroy.js';
import { deploy } from './services/deploy.js';

const enum CommandType {
  Deploy = 'deploy',
  Destroy = 'destroy',
  Help = 'help'
}

type CommandOptions = {
  command: CommandType;
  environmentFile?: string;
  projectFile?: string;
  debugMode?: boolean;
  forceMode?: boolean;
};

const checkMinVersion = () => {
  const [major, minor] = process.versions.node.split('.', 3).map((version) => {
    return parseInt(version, 10);
  });

  if (major < 20 && minor < 15) {
    console.log('Node v20.15+ is required.');
    process.exit(1);
  }
};

const suppressWarning = () => {
  const processEmit = process.emit;

  process.emit = (...args: any[]): any => {
    const [event, data] = args;

    if (event !== 'warning' || typeof data !== `object` || data.name !== 'ExperimentalWarning') {
      return processEmit.apply(process, [event, data]);
    }

    return false;
  };
};

const main = async () => {
  checkMinVersion();
  suppressWarning();

  const getAction = () => {
    const options: Partial<CommandOptions> = {};
    const input = process.argv.slice(2);

    for (let index = 0; index < input.length; index++) {
      const argument = input[index];

      switch (argument) {
        case CommandType.Deploy:
        case CommandType.Destroy:
        case CommandType.Help:
          options.command = argument;
          break;

        case '--environment':
        case '-e':
          options.environmentFile = input[++index];
          break;

        case '--project':
        case '-p':
          options.projectFile = input[++index];
          break;

        case '--debug':
          options.debugMode = true;
          break;

        case '--force':
          options.forceMode = true;
          break;
      }
    }

    if (!options.command) {
      return null;
    }

    return options as CommandOptions;
  };

  const runAction = async (options: CommandOptions) => {
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

  const runUsageHelp = async () => {
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
      '  --project, -p      Specify the project file',
      '  --debug            Enable debug mode on deployed resources',
      '  --force            Force deploy of everything',
      ''
    ];

    console.log(helpText.join('\n'));
  };

  const options = getAction();

  if (!options) {
    runUsageHelp();
    process.exit(1);
  }

  try {
    switch (options.command) {
      case CommandType.Deploy:
      case CommandType.Destroy:
        await runAction(options);
        break;

      case CommandType.Help:
        runUsageHelp();
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';

    console.log(toRed(`[EZ4]: ${message}`));

    if (options.debugMode) {
      console.error(error);
    }

    process.exit(1);
  }
};

await main();
