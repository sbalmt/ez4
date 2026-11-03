import { build, formatMessages } from 'esbuild';

import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { getTemporaryPath } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export type ViewerFunctionParameter = {
  functionName: string;
  workspacePath: string;
  define?: Record<string, string>;
};

const getBundleTemplateFile = () => {
  return join(__MODULE_PATH, '../lib/rewrite.ts');
};

export const bundleViewerFunction = async (parameters: ViewerFunctionParameter) => {
  const { functionName, define, workspacePath } = parameters;

  const templateData = await readFile(getBundleTemplateFile());

  const outputFile = getTemporaryPath(workspacePath, `cf.${functionName}.mjs`);

  await mkdir(dirname(outputFile), { recursive: true });

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
      resolveDir: workspacePath,
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
