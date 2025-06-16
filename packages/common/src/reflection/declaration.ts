import type { EverySourceType } from '@ez4/reflection';

import { relative } from 'node:path';

export const isExternalDeclaration = (type: EverySourceType) => {
  return type.file && relative(process.cwd(), type.file).startsWith('..');
};
