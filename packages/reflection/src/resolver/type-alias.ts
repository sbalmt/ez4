import type { Node, NodeArray, TypeAliasDeclaration, TypeNode } from 'typescript';
import type { EveryMemberType, TypeObject } from '../types.js';
import type { Context, State } from './common.js';

import { isTypeAliasDeclaration } from 'typescript';

import { isInternalType } from '../helpers/node.js';
import { appendTypeUnionElements, isModelProperty, isTypeObject, isTypeUnion, removeTypeUnionElements, TypeName } from '../types.js';
import { getTypeArguments } from './type-parameter.js';
import { createUndefined } from './type-undefined.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export type TypeArguments = NodeArray<TypeNode>;

export const isTypeAlias = (node: Node): node is TypeAliasDeclaration => {
  return isTypeAliasDeclaration(node);
};

export const tryTypeAlias = (node: Node, types: TypeArguments | undefined, context: Context, state: State) => {
  if (!isTypeAlias(node)) {
    return null;
  }

  if (!types) {
    return tryTypes(node.type, context, state);
  }

  const newState = getNewState({ types: state.types });
  const newTypes = getTypeArguments(node, types, context, newState);

  return tryTypes(node.type, context, { ...state, types: newTypes });
};

export const tryInternalTypeAlias = (node: Node, types: TypeArguments | undefined, context: Context, state: State): TypeObject | null => {
  if (!isTypeAlias(node) || !isInternalType(node) || !types?.length) {
    return null;
  }

  const name = node.name.getText();

  switch (name) {
    case 'Partial': {
      const result = tryTypes(types[0], context, state);

      if (!result || !isTypeObject(result) || !Array.isArray(result.members)) {
        break;
      }

      return {
        ...result,
        members: buildPartialMembers(result.members)
      };
    }

    case 'Required': {
      const result = tryTypes(types[0], context, state);

      if (!result || !isTypeObject(result) || !Array.isArray(result.members)) {
        break;
      }

      return {
        ...result,
        members: buildRequiredMembers(result.members)
      };
    }
  }

  return null;
};

const buildPartialMembers = (members: EveryMemberType[]) => {
  const membersList = [];

  for (const member of members) {
    if (!isModelProperty(member)) {
      membersList.push(member);
      continue;
    }

    const value = appendTypeUnionElements(member.value, [createUndefined()]);

    membersList.push({
      ...member,
      value
    });
  }

  return membersList;
};

const buildRequiredMembers = (members: EveryMemberType[]) => {
  const membersList = [];

  for (const member of members) {
    if (!isModelProperty(member) || !isTypeUnion(member.value)) {
      membersList.push(member);
      continue;
    }

    const value = removeTypeUnionElements(member.value, [TypeName.Undefined]);

    if (value) {
      membersList.push({
        ...member,
        value
      });
    }
  }

  return membersList;
};
