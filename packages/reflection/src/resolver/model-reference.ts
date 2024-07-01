import type { Node } from 'typescript';
import type { TypeReference } from '../types.js';
import type { Context } from './common.js';

import { TypeName } from '../types.js';
import { getNodeIdentity, isInternalType } from '../helpers/node.js';
import { getAccessNamespace } from '../helpers/identifier.js';
import { isTypeInterface } from './type-interface.js';
import { isTypeClass } from './type-class.js';
import { isTypeEnum } from './type-enum.js';

export const createReference = (
  path: string,
  internal: boolean,
  namespace?: string | null
): TypeReference => {
  return {
    type: TypeName.Reference,
    ...(namespace && { namespace }),
    ...(internal && { internal }),
    path
  };
};

export const isReferenceModel = (node: Node) => {
  return isTypeInterface(node) || isTypeEnum(node) || isTypeClass(node);
};

export const tryModelReference = (node: Node, context: Context) => {
  if (!isReferenceModel(node)) {
    return null;
  }

  const internal = isInternalType(node);
  const namespace = getAccessNamespace(node);
  const identity = getNodeIdentity(node, internal);

  const result = createReference(identity, internal, namespace);
  const event = context.events.onTypeReference;

  if (!internal) {
    context.pending.add(node);
  }

  if (event) {
    return event(result);
  }

  return result;
};
