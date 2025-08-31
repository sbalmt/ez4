import type { TypeLiteralNode } from 'typescript';
import type { EveryMemberType } from '../types.js';
import type { InterfaceNodes } from './type-interface.js';
import type { ClassNodes } from './type-class.js';
import type { Context, State } from './common.js';

import { tryModelProperty } from './model-property.js';
import { tryModelMethod } from './model-method.js';

export type NodeWithMembers = ClassNodes | InterfaceNodes | TypeLiteralNode;

export const tryModelMembers = (node: NodeWithMembers, context: Context, state: State) => {
  const memberList: EveryMemberType[] = [];

  node.members.forEach((member) => {
    const result = tryModelProperty(member, context, state) || tryModelMethod(member, context, state);

    if (result) {
      memberList.push(result);
    }
  });

  return memberList;
};
