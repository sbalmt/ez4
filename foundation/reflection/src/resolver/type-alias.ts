import type { Node, NodeArray, TypeAliasDeclaration, TypeNode } from 'typescript';
import type { EveryMemberType, EveryType } from '../types';
import type { Context, State } from './common';

import { isTypeAliasDeclaration } from 'typescript';

import { isInternalType } from '../helpers/node';
import { isModelProperty, isTypeObject, isTypeUnion, TypeName } from '../types';
import { appendTypeUnionElements, removeTypeUnionElements } from '../types/type-union';
import { getTypeArguments } from './type-parameter';
import { createUndefined } from './type-undefined';
import { getNewState } from './common';
import { tryTypes } from './types';

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

export const tryInternalTypeAlias = (node: Node, types: TypeArguments | undefined, context: Context, state: State) => {
  if (!isTypeAlias(node) || !isInternalType(node) || !types?.length) {
    return null;
  }

  const name = node.name.getText();

  switch (name) {
    case 'Required': {
      const result = tryTypes(types[0], context, state);

      return tryRequiredObject(result) ?? tryUnionElements(result, tryRequiredObject) ?? result;
    }

    case 'Partial': {
      const result = tryTypes(types[0], context, state);

      return tryPartialObject(result) ?? tryUnionElements(result, tryPartialObject) ?? result;
    }
  }

  return null;
};

const tryPartialObject = (type: EveryType | null) => {
  if (!type || !isTypeObject(type) || !Array.isArray(type.members)) {
    return null;
  }

  return {
    ...type,
    members: buildPartialMembers(type.members)
  };
};

const tryRequiredObject = (type: EveryType | null) => {
  if (!type || !isTypeObject(type) || !Array.isArray(type.members)) {
    return null;
  }

  return {
    ...type,
    members: buildRequiredMembers(type.members)
  };
};

const tryUnionElements = (type: EveryType | null, transformer: (element: EveryType) => EveryType | null) => {
  if (!type || !isTypeUnion(type)) {
    return null;
  }

  return {
    ...type,
    elements: type.elements.map((element) => {
      return transformer(element) ?? element;
    })
  };
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
