import type { ExtraSource } from '@ez4/project/library';

import { build, formatMessages } from 'esbuild';

import { dirname, join, parse, relative } from 'node:path';
import { readFile } from 'node:fs/promises';

import { SourceFileError } from '../errors/bundler.js';
import { Logger } from './logger.js';

export type BundleOptions = {
  sourceFile: string;
  wrapperFile: string;
  handlerName: string;
  filePrefix: string;
  extras?: Record<string, ExtraSource>;
  define?: Record<string, string>;
};

const getExtraContext = (extras: Record<string, ExtraSource>) => {
  const packages: string[] = [];
  const services: string[] = [];

  for (const contextName in extras) {
    const { module, from, constructor } = extras[contextName];

    const service = `${contextName}${module}`;

    packages.push(`import { ${module} as ${service} } from '${from}';`);

    services.push(`${contextName}: ${service}.${constructor}`);
  }

  return {
    packages: packages.join('\n'),
    services: `{${services.join(',\n')}}`
  };
};

export const bundleFunction = async (serviceName: string, options: BundleOptions) => {
  const sourceFile = options.sourceFile;
  const sourceName = parse(options.sourceFile).name;

  const targetPath = dirname(relative(process.cwd(), options.sourceFile));
  const targetFile = `${options.filePrefix}.${sourceName}.${options.handlerName}.mjs`;

  const outputFile = join('.ez4/tmp', targetPath, targetFile);
  const incomeFile = await readFile(options.wrapperFile);

  const context = getExtraContext(options.extras ?? {});

  const result = await build({
    bundle: true,
    minify: true,
    lineLimit: 80,
    treeShaking: true,
    outfile: outputFile,
    packages: 'bundle',
    platform: 'node',
    target: 'node20',
    format: 'esm',
    define: options.define,
    stdin: {
      loader: 'ts',
      sourcefile: 'wrapper.ts',
      resolveDir: dirname(sourceFile),
      contents: `
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire as topLevelCreateRequire } from 'module';
import { ${options.handlerName} as next } from '${sourceFile}';
${context.packages}

const __EZ4_CONTEXT = ${context.services};

${incomeFile}
      `
    },
    banner: {
      js: `
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire as topLevelCreateRequire } from 'module';

const require = topLevelCreateRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
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
    Logger.logWarning(serviceName, message);
  });

  errors.forEach((message) => {
    Logger.logError(serviceName, message);
  });

  if (errors.length) {
    throw new SourceFileError(sourceFile);
  }

  return outputFile;
};
