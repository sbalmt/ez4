import type { Node } from 'typescript';
import type { Context } from './common.js';

import { isEnumMember } from 'typescript';
import { createNumber } from './type-number.js';
import { createString } from './type-string.js';

export const tryEnumReference = (node: Node, context: Context) => {
  if (!isEnumMember(node)) {
    return null;
  }

  const type = context.checker.getTypeAtLocation(node);

  if (type.isNumberLiteral()) {
    return createNumber('literal', type.value);
  }

  if (type.isStringLiteral()) {
    return createString('literal', type.value);
  }

  return null;
};
