import type { Node } from 'typescript';
import type { TypeAny } from '../types';
import type { Context } from './common';

import { SyntaxKind } from 'typescript';
import { TypeName } from '../types';

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
