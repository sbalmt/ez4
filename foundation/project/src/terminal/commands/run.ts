import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';
import { Runner } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { getServeOptions } from '../../emulator/options';
import { getServiceEmulators } from '../../emulator/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { loadEnvironment } from '../../config/environment';
import { loadReferences } from '../../config/references';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';
import { loadPaths } from '../../config/tsconfig';

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const runCommand = async (input: InputOptions) => {
  const project = await loadProject(input.project);
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [paths, references] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadPaths(project), loadReferences(project), loadProviders(project)]);
  });

  if (input.environment) {
    loadEnvironment(input.environment);
  }

  warnUnsupportedFlags(input, {
    reset: options.local,
    environment: true,
    arguments: true,
    inspect: true,
    local: true
  });

  options.imports = references.imports;
  options.suppress = true;

  const emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      aliasPaths: {
        ...references.paths,
        ...paths
      }
    });

    return getServiceEmulators(metadata, options);
  });

  const scriptFiles = input.arguments ?? [];
  const workingDirectory = process.cwd();

  if (!scriptFiles.length) {
    Logger.warn(`One or more script files need to be specified.`);
    return;
  }

  const allScripts = await DynamicLogger.logExecution('▶️  Running script', async () => {
    Runner.configure(emulators, options);

    await prepareServices(emulators);

    await bootstrapServices(emulators);

    const scripts = [];

    for (const scriptFile of scriptFiles) {
      const scriptPath = join(workingDirectory, scriptFile);

      if (!existsSync(scriptPath)) {
        Logger.error(`Script file '${scriptFile}' not found.`);
        continue;
      }

      scripts.push(import(scriptPath));
    }

    return scripts;
  });

  await Promise.all(allScripts);

  await shutdownServices(emulators);
};
