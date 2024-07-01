import type { Node } from 'typescript';
import type { TypeAny } from '../types.js';
import type { Context } from './common.js';

import { SyntaxKind } from 'typescript';
import { TypeName } from '../types.js';

export const createAny = (): TypeAny => {
  return {
    type: TypeName.Any
  };
};

export const isTypeAny = (node: Node) => {
  return node.kind === SyntaxKind.AnyKeyword;
};

export const tryTypeAny = (node: Node, context: Context) => {
  if (!isTypeAny(node)) {
    return null;
  }

  const result = createAny();
  const event = context.events.onTypeAny;

  if (result && event) {
    return event(result);
  }

  return result;
};
