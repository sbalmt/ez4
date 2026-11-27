import type { Plugin } from 'esbuild';
import type { BundlerEntrypoint, BundlerOptions } from '../types/bundler';

import { readFile } from 'node:fs/promises';

import { ServiceEventType } from '@ez4/runtime';

import { buildServiceContext } from './context';

const ENTRYPOINT_MODULE = 'ez4:entrypoint';

export const getCompatibilityCode = () => {
  return `
import { createRequire as __EZ4_CREATE_REQUIRE } from 'node:module';
import { fileURLToPath as __EZ4_FILE_URL_TO_PATH } from 'node:url';
import { dirname as __EZ4_DIRNAME } from 'node:path';

const require = __EZ4_CREATE_REQUIRE(import.meta.url);

const __filename = __EZ4_FILE_URL_TO_PATH(import.meta.url);
const __dirname = __EZ4_DIRNAME(__filename);
`;
};

export const getEntrypointCode = async (options: BundlerOptions) => {
  const template = await readFile(options.templateFile);
  const context = buildServiceContext(options.context ?? {});

  const { handler, listener, middlewares = [] } = options;

  const handlerImports = getHandlerImports(handler, listener, middlewares);

  return `
${handlerImports}

const dispatch = async (event, context) => {
  try {
    await __EZ4_DISPATCH?.(event, context);
  } catch (error) {
    if (event.type === '${ServiceEventType.Begin}' || event.type === '${ServiceEventType.Ready}') {
      throw error;
    }

    console.error({
      traceId: Runtime.getTraceId(),
      error
    });
  }
};
${context.packages.join('\n')}

const __EZ4_MAKE_LAZY_CONTEXT_FACTORY = (context)=> {
  return new Proxy(context, {
    get: (target, property) => {
      if (typeof property !== 'string' || !(property in target)) {
        throw new Error(\`Context service '\${property.toString()}' not found.\`);
      }

      if (target[property] instanceof Function) {
        target[property] = target[property]();
      }

      return target[property];
    }
  });
}

const __EZ4_REPOSITORY = ${context.repository};
const __EZ4_CONTEXT = ${context.services};

${template}
`;
};

export const getEntrypointPlugin = async (options: BundlerOptions, workspacePath: string): Promise<Plugin> => {
  const contents = await getEntrypointCode(options);

  return {
    name: 'ez4-entrypoint',
    setup(build) {
      build.onResolve({ filter: /^ez4:entrypoint$/ }, () => ({
        path: ENTRYPOINT_MODULE,
        namespace: 'ez4'
      }));

      build.onLoad({ filter: /.*/, namespace: 'ez4' }, () => ({
        resolveDir: workspacePath,
        loader: 'ts',
        contents
      }));
    }
  };
};

const getEntrypointImport = (entrypoint: BundlerEntrypoint) => {
  return entrypoint.module ?? `./${entrypoint.sourceFile}`;
};

const getMiddlewareImports = (middlewares: BundlerEntrypoint[]) => {
  const imports: string[] = [];
  const names: string[] = [];

  middlewares.forEach((entrypoint, index) => {
    const name = `__EZ4_MIDDLEWARE_${index}`;

    imports.push(`import { ${entrypoint.functionName} as ${name} } from '${getEntrypointImport(entrypoint)}';`);
    names.push(name);
  });

  return {
    imports: imports.join('\n'),
    names
  };
};

const getHandlerImports = (handler: BundlerEntrypoint, listener: BundlerEntrypoint | undefined, middlewares: BundlerEntrypoint[]) => {
  const imports = [];

  const listenerImport = listener
    ? `import { ${listener.functionName} as __EZ4_DISPATCH } from '${getEntrypointImport(listener)}';`
    : `const __EZ4_DISPATCH = null;`;

  imports.push(listenerImport);

  if (!middlewares.length) {
    imports.push(`import { ${handler.functionName} as handle } from '${getEntrypointImport(handler)}';`);

    return imports.join('\n');
  }

  const middlewareImports = getMiddlewareImports(middlewares);

  imports.push(`import { ${handler.functionName} as __EZ4_HANDLER } from '${getEntrypointImport(handler)}';`);
  imports.push(middlewareImports.imports);

  return `
${imports.join('\n')}

let __EZ4_WRAPPED_HANDLER;

const handle = (request, context) => {
  __EZ4_WRAPPED_HANDLER ??= [${middlewareImports.names.join(', ')}].reduceRight(
    (next, middleware) => middleware(next, context),
    __EZ4_HANDLER
  );

  return __EZ4_WRAPPED_HANDLER(request, context);
};`;
};
