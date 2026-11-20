import type { NodeArray, TypeAliasDeclaration, TypeNode } from 'typescript';
import type { TypeMap, Context, State } from './common';
import type { InterfaceNodes } from './type-interface';
import type { ClassNodes } from './type-class';

import { tryTypes } from './types';

type NodeWithTypeParameters = ClassNodes | InterfaceNodes | TypeAliasDeclaration;

export type TypeArguments = NodeArray<TypeNode>;

export const getTypeArguments = (node: NodeWithTypeParameters, types: TypeArguments, context: Context, state: State) => {
  const newTypes: TypeMap = {};

  node.typeParameters?.forEach((parameter, index) => {
    const type = types?.at(index);

    if (type) {
      const parameterName = parameter.name.getText();
      const parameterType = tryTypes(type, context, state);

      newTypes[parameterName] = parameterType;
    }
  });

  return newTypes;
};
