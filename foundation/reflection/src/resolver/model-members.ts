import type { TypeLiteralNode } from 'typescript';
import type { EveryMemberType } from '../types';
import type { InterfaceNodes } from './type-interface';
import type { ClassNodes } from './type-class';
import type { Context, State } from './common';

import { tryModelProperty } from './model-property';
import { tryModelMethod } from './model-method';

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
