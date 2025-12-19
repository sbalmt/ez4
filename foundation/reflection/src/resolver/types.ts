import type { Node } from 'typescript';
import type { EveryType } from '../types';
import type { Context, State } from './common';

import { isParenthesizedTypeNode, isRestTypeNode } from 'typescript';

import { tryTypeAny } from './type-any';
import { tryTypeVoid } from './type-void';
import { tryTypeNever } from './type-never';
import { tryTypeUnknown } from './type-unknown';
import { tryTypeUndefined } from './type-undefined';
import { tryTypeNull } from './type-null';
import { tryTypeBoolean } from './type-boolean';
import { tryTypeNumber } from './type-number';
import { tryTypeString } from './type-string';
import { tryTypeObject } from './type-object';
import { tryTypeUnion } from './type-union';
import { tryTypeIntersection } from './type-intersection';
import { tryTypeArray } from './type-array';
import { tryTypeTuple } from './type-tuple';
import { tryTypeReference } from './type-reference';
import { tryTypeParameter } from './type-parameter';
import { tryTypeCallback } from './type-callback';
import { tryTypeOf } from './type-of';
import { tryEnumReference } from './enum-reference';

export const tryTypes = (node: Node, context: Context, state: State): EveryType | undefined => {
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
