import type { ExpressionWithTypeArguments, Node } from 'typescript';
import type { EveryMemberType, ModelHeritage } from '../types';
import type { Context, State } from './common';

import { isExpressionWithTypeArguments } from 'typescript';
import { getNodeIdentity, isInternalType } from '../helpers/node';
import { getNodeTypeDeclaration } from '../helpers/declaration';
import { getAccessNamespace } from '../helpers/identifier';
import { hasModifierExport } from '../helpers/modifier';
import { tryModelMembers } from './model-members';
import { getTypeArguments } from './type-parameter';
import { isTypeInterface } from './type-interface';
import { isTypeAlias } from './type-alias';
import { isTypeClass } from './type-class';
import { getNewState } from './common';

export const createModelHeritage = (path: string, namespace?: string | undefined, members?: EveryMemberType[]): ModelHeritage => {
  return {
    path,
    ...(namespace && { namespace }),
    ...(members?.length && { members })
  };
};

export const isHeritageMember = (node: Node): node is ExpressionWithTypeArguments => {
  return isExpressionWithTypeArguments(node);
};

export const tryHeritageMember = (node: Node, context: Context, state: State) => {
  if (!isHeritageMember(node)) {
    return undefined;
  }

  const declaration = getNodeTypeDeclaration(node.expression, context.checker);

  if (!declaration || isInternalType(declaration)) {
    return undefined;
  }

  if (!hasModifierExport(declaration)) {
    context.pending.add(declaration);
  }

  const identity = getNodeIdentity(node.expression);
  const namespace = getAccessNamespace(node.expression);
  const types = node.typeArguments;

  if (!types || isTypeAlias(declaration)) {
    return createModelHeritage(identity, namespace);
  }

  if (isTypeClass(declaration) || isTypeInterface(declaration)) {
    const newState = getNewState({ types: state.types });
    const newTypes = getTypeArguments(declaration, types, context, newState);
    const results = tryModelMembers(declaration, context, { ...state, types: newTypes });

    return createModelHeritage(identity, namespace, results);
  }

  return undefined;
};
