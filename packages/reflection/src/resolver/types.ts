import type { Node } from 'typescript';
import type { EveryType } from '../types.js';
import type { Context, State } from './common.js';

import { isParenthesizedTypeNode, isRestTypeNode } from 'typescript';

import { tryTypeAny } from './type-any.js';
import { tryTypeVoid } from './type-void.js';
import { tryTypeNever } from './type-never.js';
import { tryTypeUnknown } from './type-unknown.js';
import { tryTypeUndefined } from './type-undefined.js';
import { tryTypeNull } from './type-null.js';
import { tryTypeBoolean } from './type-boolean.js';
import { tryTypeNumber } from './type-number.js';
import { tryTypeString } from './type-string.js';
import { tryTypeObject } from './type-object.js';
import { tryTypeUnion } from './type-union.js';
import { tryTypeIntersection } from './type-intersection.js';
import { tryTypeArray } from './type-array.js';
import { tryTypeTuple } from './type-tuple.js';
import { tryTypeReference } from './type-reference.js';
import { tryTypeParameter } from './type-parameter.js';
import { tryTypeCallback } from './type-callback.js';
import { tryTypeOf } from './type-of.js';
import { tryEnumReference } from './enum-reference.js';

export const tryTypes = (node: Node, context: Context, state: State): EveryType | null => {
  if (isParenthesizedTypeNode(node)) {
    return tryTypes(node.type, context, state);
  }

  if (isRestTypeNode(node)) {
    return tryTypes(node.type, context, { ...state, spread: true });
  }

  return (
    tryTypeAny(node, context) ||
    tryTypeVoid(node, context) ||
    tryTypeNever(node, context) ||
    tryTypeUnknown(node, context) ||
    tryTypeUndefined(node, context) ||
    tryTypeNull(node, context) ||
    tryTypeBoolean(node, context) ||
    tryTypeNumber(node, context) ||
    tryTypeString(node, context) ||
    tryTypeObject(node, context, state) ||
    tryTypeUnion(node, context, state) ||
    tryTypeIntersection(node, context, state) ||
    tryTypeArray(node, context, state) ||
    tryTypeTuple(node, context, state) ||
    tryTypeReference(node, context, state) ||
    tryTypeParameter(node, context, state) ||
    tryTypeCallback(node, context, state) ||
    tryTypeOf(node, context, state) ||
    tryEnumReference(node, context)
  );
};
