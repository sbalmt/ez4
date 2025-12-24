import type { Node } from 'typescript';
import type { TypeVoid } from '../types';
import type { Context } from './common';

import { SyntaxKind } from 'typescript';
import { TypeName } from '../types';

export const createVoid = (): TypeVoid => {
  return {
    type: TypeName.Void
  };
};

export const isTypeVoid = (node: Node) => {
  return node.kind === SyntaxKind.VoidKeyword;
};

export const tryTypeVoid = (node: Node, context: Context) => {
  if (!isTypeVoid(node)) {
    return undefined;
  }

  const result = createVoid();
  const event = context.events.onTypeVoid;

  if (result && event) {
    return event(result);
  }

  return result;
};
