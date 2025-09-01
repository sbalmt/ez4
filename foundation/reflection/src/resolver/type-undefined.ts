import type { Node } from 'typescript';
import type { TypeUndefined } from '../types';
import type { Context } from './common';

import { SyntaxKind } from 'typescript';
import { TypeName } from '../types';

export const createUndefined = (): TypeUndefined => {
  return {
    type: TypeName.Undefined
  };
};

export const isTypeUndefined = (node: Node) => {
  return node.kind === SyntaxKind.UndefinedKeyword;
};

export const tryTypeUndefined = (node: Node, context: Context) => {
  if (!isTypeUndefined(node)) {
    return null;
  }

  const result = createUndefined();
  const event = context.events.onTypeUndefined;

  if (result && event) {
    return event(result);
  }

  return result;
};
