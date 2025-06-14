import type { Node, SourceFile } from 'typescript';
import type { SourceMap } from '../types.js';
import type { Context } from './common.js';

import { getNodeIdentity } from '../helpers/node.js';
import { hasModifierExport } from '../helpers/modifier.js';
import { isTypeInterface, mergeTypeInterface } from '../types.js';
import { tryTypeFunction } from './type-function.js';
import { tryTypeInterface } from './type-interface.js';
import { tryTypeClass } from './type-class.js';
import { tryTypeEnum } from './type-enum.js';
import { getNewState } from './common.js';

export const trySource = (node: SourceFile, context: Context) => {
  if (node.isDeclarationFile) {
    return null;
  }

  const reflection: SourceMap = {};

  const resolveStatement = (node: Node) => {
    const state = getNewState();

    const result =
      tryTypeEnum(node, context) ||
      tryTypeInterface(node, context, state) ||
      tryTypeClass(node, context, state) ||
      tryTypeFunction(node, context, state);

    if (result) {
      const identity = getNodeIdentity(node);
      const current = reflection[identity];

      if (!current) {
        reflection[identity] = result;
      } else if (!isTypeInterface(current) || !isTypeInterface(result)) {
        throw new Error(`Source identity '${result.name}' has a naming collision.`);
      } else {
        reflection[identity] = mergeTypeInterface(result, current);
      }
    }
  };

  node.statements.forEach((statement) => {
    if (hasModifierExport(statement)) {
      resolveStatement(statement);
    }
  });

  context.pending.forEach((statement) => {
    if (!context.cache.has(statement)) {
      resolveStatement(statement);
    }
  });

  return reflection;
};
