import type { Node } from 'typescript';
import type { Context } from './common';

import { isEnumMember } from 'typescript';
import { createNumber } from './type-number';
import { createString } from './type-string';

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
