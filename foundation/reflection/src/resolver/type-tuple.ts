import type { Node, TupleTypeNode } from 'typescript';
import type { TypeTuple, EveryType } from '../types.js';
import type { ArrayState, Context, State } from './common.js';

import { isTupleTypeNode } from 'typescript';
import { TypeName } from '../types.js';
import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export const createTuple = (elements: EveryType[], state: ArrayState): TypeTuple => {
  const { spread } = state;

  return {
    type: TypeName.Tuple,
    ...(spread && { spread }),
    elements
  };
};

export const isTypeTuple = (node: Node): node is TupleTypeNode => {
  return isTupleTypeNode(node);
};

export const tryTypeTuple = (node: Node, context: Context, state: State) => {
  if (!isTupleTypeNode(node)) {
    return null;
  }

  const newState = getNewState({ types: state.types });
  const tupleTypes: EveryType[] = [];

  node.elements.forEach((element) => {
    const elementType = tryTypes(element, context, newState);

    if (elementType) {
      tupleTypes.push(elementType);
    }
  });

  return createTuple(tupleTypes, state);
};
