import type { ExpressionWithTypeArguments, Node } from 'typescript';
import type { EveryMemberType, ModelHeritage } from '../types.js';
import type { Context, State } from './common.js';

import { isExpressionWithTypeArguments } from 'typescript';
import { getNodeIdentity, isInternalType } from '../helpers/node.js';
import { getNodeTypeDeclaration } from '../helpers/declaration.js';
import { getAccessNamespace } from '../helpers/identifier.js';
import { hasModifierExport } from '../helpers/modifier.js';
import { tryModelMembers } from './model-members.js';
import { getTypeArguments } from './type-parameter.js';
import { isTypeInterface } from './type-interface.js';
import { isTypeAlias } from './type-alias.js';
import { isTypeClass } from './type-class.js';
import { getNewState } from './common.js';

export const createModelHeritage = (path: string, namespace?: string | null, members?: EveryMemberType[]): ModelHeritage => {
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
    return null;
  }

  const declaration = getNodeTypeDeclaration(node.expression, context.checker);

  if (!declaration || isInternalType(declaration)) {
    return null;
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

  return null;
};
