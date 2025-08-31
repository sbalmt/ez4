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
  const reflection: SourceMap = {};

  const resolveStatement = (node: Node) => {
    const state = getNewState();

    const resultType =
      tryTypeEnum(node, context) ||
      tryTypeInterface(node, context, state) ||
      tryTypeClass(node, context, state) ||
      tryTypeFunction(node, context, state);

    if (resultType) {
      const identity = getNodeIdentity(node);
      const current = reflection[identity];

      if (!current) {
        reflection[identity] = resultType;
        return;
      }

      if (!isTypeInterface(current) || !isTypeInterface(resultType)) {
        throw new Error(`Source identity '${resultType.name}' has a naming collision.`);
      }

      reflection[identity] = mergeTypeInterface(resultType, current);
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
