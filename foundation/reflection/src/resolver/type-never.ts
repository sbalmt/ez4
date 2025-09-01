import type { Node } from 'typescript';
import type { TypeNever } from '../types';
import type { Context } from './common';

import { SyntaxKind } from 'typescript';
import { TypeName } from '../types';

export const createNever = (): TypeNever => {
  return {
    type: TypeName.Never
  };
};

export const isTypeNever = (node: Node) => {
  return node.kind === SyntaxKind.NeverKeyword;
};

export const tryTypeNever = (node: Node, context: Context) => {
  if (!isTypeNever(node)) {
    return null;
  }

  const result = createNever();
  const event = context.events.onTypeNever;

  if (result && event) {
    return event(result);
  }

  return result;
};
