import type { FunctionCallback, FunctionSource } from '../types/function';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const loadCallback = async (source: FunctionSource) => {
  const specifier = 'module' in source ? source.module : pathToFileURL(join(process.cwd(), source.file)).href;

  const { [source.name]: callback } = await import(specifier);

  return {
    callback: callback as FunctionCallback,
    specifier
  };
};
