import type { Context, State } from './common.js';
import type { MethodNodes } from './model-method.js';
import type { CallbackNodes } from './type-callback.js';
import type { FunctionNodes } from './type-function.js';

import { getNewState } from './common.js';
import { tryTypes } from './types.js';

export type NodeWithReturns = MethodNodes | CallbackNodes | FunctionNodes;

export const tryCallableReturns = (node: NodeWithReturns, context: Context, state: State) => {
  if (context.options.ignoreReturns || !node.type) {
    return null;
  }

  const newState = getNewState({ types: state.types });

  return tryTypes(node.type, context, newState);
};
