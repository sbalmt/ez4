import type { ProjectOptions } from '../../types/project';
import type { InputOptions } from '../options';

import { Runner, Logger, LogLevel } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { getServiceEmulators } from '../../emulator/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { getServeOptions } from '../../emulator/options';
import { loadAliasPaths } from '../../config/tsconfig';
import { loadProviders } from '../../config/providers';
import { loadImports } from '../../config/imports';

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const runCommand = async (input: InputOptions, project: ProjectOptions) => {
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [aliasPaths, allImports] = await Logger.execute('⚡ Initializing', () => {
    return Promise.all([loadAliasPaths(project), loadImports(project), loadProviders(project)]);
  });

  warnUnsupportedFlags(input, {
    arguments: true,
    reset: options.local,
    local: true
  });

  options.imports = allImports;
  options.suppress = true;

  const emulators = await Logger.execute('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths
    });

    return getServiceEmulators(metadata, options);
  });

  const allScriptFiles = input.arguments ?? [];
  const workingDirectory = process.cwd();

  await Logger.execute('▶️  Running script', async () => {
    Runner.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    for (const scriptFile of allScriptFiles) {
      const scriptPath = join(workingDirectory, scriptFile);

      if (!existsSync(scriptPath)) {
        Logger.error(`File ${scriptFile} not found.`);
        continue;
      }

      await import(scriptPath);
    }

    await shutdownServices(emulators);
  });
};
