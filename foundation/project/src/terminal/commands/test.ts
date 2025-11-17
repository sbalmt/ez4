import type { ProjectOptions } from '../../types/project';
import type { ServeOptions } from '../../types/options';
import type { InputOptions } from '../options';

import { Tester, Logger, LogLevel } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

import { buildMetadata } from '../../library/metadata';
import { getServiceEmulators } from '../../emulator/utils';
import { bootstrapServices, prepareServices } from '../../emulator/actions';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { loadImports } from '../../config/imports';

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const TestFilePattern = /\.(spec|test)\.(js|ts)$/;

export const testCommand = async (input: InputOptions, project: ProjectOptions) => {
  const serveOptions = project.serveOptions;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  const options: ServeOptions = {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    serviceHost: `${serviceHost}:${servicePort}`,
    localOptions: project.localOptions ?? {},
    variables: project.variables,
    force: project.debugMode,
    debug: project.debugMode,
    reset: project.resetMode,
    local: project.localMode,
    test: true,
    version: 0
  };

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  await Logger.execute('🔄️ Loading providers', () => {
    return loadProviders(project);
  });

  const aliasPaths = await Logger.execute('🔄️ Loading tsconfig', () => {
    return loadAliasPaths(project);
  });

  options.imports = await Logger.execute('🔄️ Loading imports', () => {
    return loadImports(project);
  });

  const emulators = await Logger.execute('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths
    });

    return getServiceEmulators(metadata, options);
  });

  const workingDirectory = process.cwd();

  const testFiles = await Logger.execute('⚡ Preparing tests', async () => {
    Tester.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    const allFiles = await readdir(workingDirectory, {
      recursive: true
    });

    return allFiles.filter((file) => {
      if (TestFilePattern.test(file)) {
        return !input.arguments || file.includes(input.arguments);
      }

      return false;
    });
  });

  for (const testFile of testFiles) {
    await import(join(workingDirectory, testFile));
  }
};
