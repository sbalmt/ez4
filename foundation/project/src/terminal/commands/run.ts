import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Runner, Logger, LogLevel } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { getServiceEmulators } from '../../emulator/utils';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/actions';
import { getServeOptions } from '../../emulator/options';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { loadImports } from '../../config/imports';

import { join } from 'node:path';

export const runCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getServeOptions(project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  options.imports = allImports;

  const emulators = await Logger.execute('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths
    });

    return getServiceEmulators(metadata, options);
  });

  const workingDirectory = process.cwd();

  await Logger.execute('▶️  Running script', async () => {
    Runner.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    if (input.arguments) {
      await import(join(workingDirectory, input.arguments));
    }

    await shutdownServices(emulators);
  });
};
