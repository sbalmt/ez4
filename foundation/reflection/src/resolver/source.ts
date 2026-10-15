import type { Node, SourceFile } from 'typescript';
import type { ReflectionTypes } from '../types';
import type { Context } from './common';

import { getNodeIdentity } from '../helpers/node';
import { hasModifierExport } from '../helpers/modifier';
import { isTypeClass, isTypeInterface, mergeTypeClass, mergeTypeInterface } from '../types';
import { tryTypeFunction } from './type-function';
import { tryTypeInterface } from './type-interface';
import { tryTypeClass } from './type-class';
import { tryTypeEnum } from './type-enum';
import { getNewState } from './common';

export const trySource = (node: SourceFile, context: Context) => {
  const reflection: ReflectionTypes = {};

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

      if (isTypeInterface(current) && isTypeInterface(resultType)) {
        reflection[identity] = mergeTypeInterface(resultType, current);
        return;
      }

      if (isTypeClass(current) && isTypeInterface(resultType)) {
        reflection[identity] = mergeTypeClass(resultType, current);
        return;
      }

      if (isTypeInterface(current) && isTypeClass(resultType)) {
        reflection[identity] = mergeTypeClass(current, resultType);
        return;
      }

      throw new Error(`Source identity '${resultType.name}' has a naming collision.`);
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
