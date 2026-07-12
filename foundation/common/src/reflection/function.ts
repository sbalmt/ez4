import type { TypeCallback, TypeFunction } from '@ez4/reflection';
import type { AnyObject } from '@ez4/utils';

import { isObjectWith } from '@ez4/utils';

import { getDeclarationDescription, getDeclarationSummary } from './declaration';

export type FunctionSignature = {
  name: string;
  file: string;
  position: [number, number];
  description?: string;
  summary?: string;
  module?: string;
};

export const isFunctionSignature = (type: AnyObject): type is FunctionSignature => {
  return isObjectWith(type, ['name', 'file', 'position']);
};

export const getFunctionSignature = (type: TypeCallback | TypeFunction) => {
  const { name, file, position, module } = type;

  const description = getDeclarationDescription(type);
  const summary = getDeclarationSummary(type);

  const metadata = {
    ...(name && { name }),
    ...(file && { file }),
    ...(position && { position: [position.line, position.character] }),
    ...(description && { description }),
    ...(summary && { summary }),
    ...(module && { module })
  };

  if (isFunctionSignature(metadata)) {
    return metadata;
  }

  return undefined;
};
