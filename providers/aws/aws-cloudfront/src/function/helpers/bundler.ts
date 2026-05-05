import { build, formatMessages } from 'esbuild';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getTemporaryPath } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export type ViewerFunctionParameter = {
  templateFile: string;
  functionName: string;
  define?: Record<string, string>;
};

export const bundleViewerFunction = async (parameters: ViewerFunctionParameter) => {
  const { templateFile, functionName, define } = parameters;

  const templatePath = join(__MODULE_PATH, '../lib/', templateFile);
  const templateData = await readFile(templatePath);

  const outputFile = getTemporaryPath(`cf.${functionName}.mjs`);

  const result = await build({
    outfile: outputFile,
    minifySyntax: true,
    minifyWhitespace: true,
    treeShaking: false,
    platform: 'neutral',
    format: 'esm',
    target: 'es6',
    bundle: true,
    define,
    stdin: {
      resolveDir: process.cwd(),
      contents: templateData,
      sourcefile: 'main.ts',
      loader: 'ts'
    }
  });

  const [errors, warnings] = await Promise.all([
    formatMessages(result.errors, {
      kind: 'error',
      color: false
    }),
    formatMessages(result.warnings, {
      kind: 'warning',
      color: false
    })
  ]);

  warnings.forEach((message) => {
    Logger.warn(message);
  });

  errors.forEach((message) => {
    Logger.error(message);
  });

  if (errors.length) {
    throw new Error('Unable to bundle viewer function.');
  }

  return outputFile;
};
