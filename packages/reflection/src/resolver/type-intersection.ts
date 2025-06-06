import type { IntersectionTypeNode, Node } from 'typescript';
import type { EveryType, TypeIntersection } from '../types.js';
import type { Context, State } from './common.js';

import { isIntersectionTypeNode } from 'typescript';
import { TypeName } from '../types.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export const createIntersection = (elements: EveryType[]): TypeIntersection => {
  return {
    type: TypeName.Intersection,
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

  const newState = getNewState({ types: state.types });
  const intersectionTypes: EveryType[] = [];

  node.types.forEach((type) => {
    const elementType = tryTypes(type, context, newState);

    if (elementType) {
      intersectionTypes.push(elementType);
    }
  });

  return createIntersection(intersectionTypes);
};
