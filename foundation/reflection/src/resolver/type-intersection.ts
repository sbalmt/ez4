import type { IntersectionTypeNode, Node } from 'typescript';
import type { EveryType, TypeIntersection } from '../types';
import type { Context, State } from './common';

import { isIntersectionTypeNode } from 'typescript';

import { getPathModule } from '../utils/module';
import { getNodeFilePath } from '../helpers/node';
import { TypeName } from '../types';
import { getNewState } from './common';
import { tryTypes } from './types';

export const createIntersection = (file: string | null, elements: EveryType[]): TypeIntersection => {
  return {
    type: TypeName.Intersection,
    ...(file && { file }),
    ...(file && { module: getPathModule(file) }),
    elements
  };
};

export const isTypeIntersection = (node: Node): node is IntersectionTypeNode => {
  return isIntersectionTypeNode(node);
};

export const tryTypeIntersection = (node: Node, context: Context, state: State) => {
  if (!isTypeIntersection(node)) {
    return null;
  }

  const file = context.options.includePath ? getNodeFilePath(node) : null;

  const newState = getNewState({ types: state.types });
  const allTypes: EveryType[] = [];

  node.types.forEach((type) => {
    const elementType = tryTypes(type, context, newState);

    if (elementType) {
      allTypes.push(elementType);
    }
  });

  return createIntersection(file, allTypes);
};
