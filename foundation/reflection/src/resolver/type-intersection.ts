import type { IntersectionTypeNode, Node } from 'typescript';
import type { EveryType, TypeIntersection, TypePosition } from '../types';
import type { Context, State } from './common';

import { isIntersectionTypeNode } from 'typescript';

import { getPathModule } from '../utils/module';
import { getNodeFilePosition, getNodeFilePath } from '../helpers/node';
import { TypeName } from '../types';
import { getNewState } from './common';
import { tryTypes } from './types';

export const createIntersection = (
  file: string | undefined,
  position: TypePosition | undefined,
  elements: EveryType[]
): TypeIntersection => {
  const module = file && getPathModule(file);

  return {
    type: TypeName.Intersection,
    ...(file && { file }),
    ...(position && { position }),
    ...(module && { module }),
    elements
  };
};

export const isTypeIntersection = (node: Node): node is IntersectionTypeNode => {
  return isIntersectionTypeNode(node);
};

export const tryTypeIntersection = (node: Node, context: Context, state: State) => {
  if (!isTypeIntersection(node)) {
    return undefined;
  }

  const file = context.options.includePath ? getNodeFilePath(node) : undefined;
  const position = context.options.includePath ? getNodeFilePosition(node) : undefined;
  const event = context.events.onTypeIntersection;

  const newState = getNewState({ types: state.types });
  const allTypes: EveryType[] = [];

  node.types.forEach((type) => {
    const elementType = tryTypes(type, context, newState);

    if (elementType) {
      allTypes.push(elementType);
    }
  });

  const type = createIntersection(file, position, allTypes);

  if (event) {
    return event(type);
  }

  return type;
};
