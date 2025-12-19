import type { Node } from 'typescript';
import type { EnumNumberMember, EnumStringMember, EnumMember } from '../types';
import type { EnumNodes } from './type-enum';
import type { Context } from './common';

import { isEnumMember } from 'typescript';
import { getNodeDocumentation } from '../helpers/documentation';
import { TypeName } from '../types';

export const createEnumMember = <T extends EnumMember>(
  type: T['type'],
  value: T['value'],
  name: string,
  description: string | undefined
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
    return undefined;
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

  return undefined;
};

export const tryEnumMembers = (node: EnumNodes, context: Context) => {
  const memberList: EnumMember[] = [];

  node.members.forEach((member) => {
    const result = tryEnumMember(member, context);

    if (result) {
      memberList.push(result);
    }
  });

  return memberList;
};
