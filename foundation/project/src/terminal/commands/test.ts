import type { InputOptions } from '../options';

import { Logger, DynamicLogger, LogLevel } from '@ez4/logger';
import { Tester } from '@ez4/project/library';

import { buildMetadata } from '../../library/metadata';
import { warnUnsupportedFlags } from '../../utils/flags';
import { getServeOptions } from '../../emulator/options';
import { getServiceEmulators } from '../../emulator/service';
import { bootstrapServices, prepareServices, shutdownServices } from '../../emulator/utils/hooks';
import { loadEnvironment } from '../../config/environment';
import { loadReferences } from '../../config/references';
import { loadProviders } from '../../config/providers';
import { loadProject } from '../../config/project';

import { spec } from 'node:test/reporters';
import { after, before, run } from 'node:test';
import { glob } from 'node:fs/promises';
import { join } from 'node:path';

export const testCommand = async (input: InputOptions) => {
  if (input.environment) {
    loadEnvironment(input.environment);
  }

  const project = await loadProject(input.project);
  const options = getServeOptions(input, project);

  if (options.debug) {
    Logger.setLevel(LogLevel.Debug);
  }

  const [{ main }] = await DynamicLogger.logExecution('⚡ Initializing', () => {
    return Promise.all([loadReferences(project), loadProviders(project)]);
  });

  warnUnsupportedFlags(input, {
    reset: options.local,
    environment: true,
    arguments: true,
    coverage: true,
    inspect: true,
    local: true
  });

  options.imports = main.imports;
  options.suppress = true;
  options.test = true;

  const emulators = await DynamicLogger.logExecution('🔄️ Loading emulators', () => {
    const { metadata } = buildMetadata(project.sourceFiles, {
      workspacePath: project.workspacePath,
      aliasPaths: main.paths
    });

    return getServiceEmulators(metadata, options);
  });

  const filePatterns = input.arguments;

  const testFiles = await DynamicLogger.logExecution('🧪 Preparing tests', async () => {
    Tester.configure(emulators, options);

    await prepareServices(emulators);

    const testFiles: string[] = [];

    const allFiles = glob('**/*.{spec,test}.{js,ts}', {
      exclude: ['**/node_modules/**'],
      cwd: project.workspacePath
    });

    for await (const file of allFiles) {
      if (!filePatterns || filePatterns.some((filePattern) => file.includes(filePattern))) {
        testFiles.push(join(project.workspacePath, file));
      }
    }

    return testFiles;
  });

  if (!testFiles.length) {
    Logger.warn(`One or more test files need to be specified`);
    return;
  }

  const testRunner = run({
    coverage: input.coverage,
    coverageIncludeGlobs: [`${project.workspacePath}/**/*`],
    isolation: 'none',
    files: testFiles,
    forceExit: true,
    timeout: 5000,
    setup: () => {
      before(async () => {
        await bootstrapServices(emulators);
      });
      after(async () => {
        await shutdownServices(emulators);
      });
    }
  });

  testRunner.compose(spec).pipe(process.stdout);

  testRunner.on('test:summary', ({ success }) => {
    if (!success) {
      process.exitCode = 1;
    }
  });
};
