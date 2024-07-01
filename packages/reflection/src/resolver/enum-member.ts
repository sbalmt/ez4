import type { Node } from 'typescript';
import type { EnumNumberMember, EnumStringMember, EnumMember } from '../types.js';
import type { Context } from './common.js';

import { isEnumMember } from 'typescript';
import { getNodeDocumentation } from '../helpers/documentation.js';
import { TypeName } from '../types.js';

export const createEnumMember = <T extends EnumMember>(
  type: T['type'],
  value: T['value'],
  name: string,
  description: string | null
) => {
  return {
    type,
    name,
    value,
    ...(description && { description })
  } as T;
};

export const tryEnumMember = (node: Node, context: Context) => {
  if (!isEnumMember(node)) {
    return null;
  }

  const type = context.checker.getTypeAtLocation(node);
  const description = getNodeDocumentation(node.name, context.checker);
  const name = node.name.getText();

  if (type.isNumberLiteral()) {
    return createEnumMember<EnumNumberMember>(TypeName.Number, type.value, name, description);
  }

  if (type.isStringLiteral()) {
    return createEnumMember<EnumStringMember>(TypeName.String, type.value, name, description);
  }

  return null;
};
