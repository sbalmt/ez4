import type { Node } from 'typescript';
import type { TypeUnknown } from '../types.js';
import type { Context } from './common.js';

import { SyntaxKind } from 'typescript';
import { TypeName } from '../types.js';

export const createUnknown = (): TypeUnknown => {
  return {
    type: TypeName.Unknown
  };
};

export const isTypeUnknown = (node: Node) => {
  return node.kind === SyntaxKind.UnknownKeyword;
};

export const tryTypeUnknown = (node: Node, context: Context) => {
  if (!isTypeUnknown(node)) {
    return null;
  }

  const result = createUnknown();
  const event = context.events.onTypeUnknown;

  if (result && event) {
    return event(result);
  }

  return result;
};
