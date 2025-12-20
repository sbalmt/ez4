import type { TypeCallback, TypeFunction } from '@ez4/reflection';
import type { AnyObject } from '@ez4/utils';

import { isObjectWith } from '@ez4/utils';

export type FunctionSignature = {
  name: string;
  file: string;
  position: [number, number];
  description?: string;
  module?: string;
};

export const isFunctionSignature = (type: AnyObject): type is FunctionSignature => {
  return isObjectWith(type, ['name', 'file', 'position']);
};

export const getFunctionSignature = (type: TypeCallback | TypeFunction) => {
  const { description, name, file, position, module } = type;

  const metadata = {
    ...(name && { name }),
    ...(file && { file }),
    ...(position && { position: [position.line, position.character] }),
    ...(description && { description }),
    ...(module && { module })
  };

  if (isFunctionSignature(metadata)) {
    return metadata;
  }

  return undefined;
};
