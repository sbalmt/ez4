import type { Node, NodeArray, TypeAliasDeclaration, TypeNode } from 'typescript';
import type { EveryMemberType, EveryType } from '../types';
import type { Context, State } from './common';

import { isTypeAliasDeclaration } from 'typescript';

import { isInternalType } from '../helpers/node';
import { isModelProperty } from '../types/model-property';
import { appendTypeUnionElements, removeTypeUnionElements, isTypeUnion } from '../types/type-union';
import { isTypeObject } from '../types/type-object';
import { isTypeString } from '../types/type-string';
import { isTypeNumber } from '../types/type-number';
import { getTypeArguments } from './type-parameter';
import { createUndefined } from './type-undefined';
import { TypeName } from '../types/common';
import { getNewState } from './common';
import { tryTypes } from './types';

export type TypeArguments = NodeArray<TypeNode>;

export const isTypeAlias = (node: Node): node is TypeAliasDeclaration => {
  return isTypeAliasDeclaration(node);
};

export const tryTypeAlias = (node: Node, types: TypeArguments | undefined, context: Context, state: State) => {
  if (!isTypeAlias(node)) {
    return undefined;
  }

  if (!types) {
    return tryTypes(node.type, context, getNewState({ spread: state.spread }));
  }

  const newState = getNewState({ types: state.types });
  const newTypes = getTypeArguments(node, types, context, newState);

  return tryTypes(node.type, context, { ...state, types: newTypes });
};

export const tryNativeTypeAlias = (node: Node, types: TypeArguments | undefined, context: Context, state: State) => {
  if (!isTypeAlias(node) || !isInternalType(node) || !types?.length) {
    return undefined;
  }

  const name = node.name.getText();

  switch (name) {
    case 'Pick': {
      const resultType = tryTypes(types[0], context, state);
      const resultKeys = getMemberKeys(tryTypes(types[1], context, state));

      return tryPickObject(resultType, resultKeys) ?? tryUnionElements(resultType, (type) => tryPickObject(type, resultKeys));
    }

    case 'Omit': {
      const resultType = tryTypes(types[0], context, state);
      const resultKeys = getMemberKeys(tryTypes(types[1], context, state));

      return tryOmitObject(resultType, resultKeys) ?? tryUnionElements(resultType, (type) => tryOmitObject(type, resultKeys));
    }

    case 'Required': {
      const resultType = tryTypes(types[0], context, state);

      return tryRequiredObject(resultType) ?? tryUnionElements(resultType, tryRequiredObject) ?? resultType;
    }

    case 'Partial': {
      const resultType = tryTypes(types[0], context, state);

      return tryPartialObject(resultType) ?? tryUnionElements(resultType, tryPartialObject) ?? resultType;
    }
  }

  return undefined;
};

const getMemberKeys = (type: EveryType | undefined): string[] => {
  if (type) {
    if (isTypeString(type) || isTypeNumber(type)) {
      return type.literal !== undefined ? [String(type.literal)] : [];
    }

    if (isTypeUnion(type)) {
      return type.elements.flatMap((element) => getMemberKeys(element));
    }
  }

  return [];
};

const tryPickObject = (type: EveryType | undefined, keys: string[]) => {
  if (!type || !isTypeObject(type) || !Array.isArray(type.members)) {
    return undefined;
  }

  return {
    ...type,
    members: type.members.filter((member) => keys.includes(member.name))
  };
};

const tryOmitObject = (type: EveryType | undefined, keys: string[]) => {
  if (!type || !isTypeObject(type) || !Array.isArray(type.members)) {
    return undefined;
  }

  return {
    ...type,
    members: type.members.filter((member) => !keys.includes(member.name))
  };
};

const tryPartialObject = (type: EveryType | undefined) => {
  if (!type || !isTypeObject(type) || !Array.isArray(type.members)) {
    return undefined;
  }

  return {
    ...type,
    members: buildPartialMembers(type.members)
  };
};

const tryRequiredObject = (type: EveryType | undefined) => {
  if (!type || !isTypeObject(type) || !Array.isArray(type.members)) {
    return undefined;
  }

  return {
    ...type,
    members: buildRequiredMembers(type.members)
  };
};

const tryUnionElements = (type: EveryType | undefined, transformer: (element: EveryType) => EveryType | undefined) => {
  if (!type || !isTypeUnion(type)) {
    return undefined;
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
