import type { Context, State } from './common';
import type { MethodNodes } from './model-method';
import type { CallbackNodes } from './type-callback';
import type { FunctionNodes } from './type-function';

import { getNewState } from './common';
import { tryTypes } from './types';

export type NodeWithReturns = MethodNodes | CallbackNodes | FunctionNodes;

export const tryCallableReturns = (node: NodeWithReturns, context: Context, state: State) => {
  if (context.options.ignoreReturns || !node.type) {
    return null;
  }

  const newState = getNewState({ types: state.types });

  return tryTypes(node.type, context, newState);
};
