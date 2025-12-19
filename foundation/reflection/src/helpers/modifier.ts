import type { Node } from 'typescript';
import type { ClassModifiers } from '../types/type-class';
import type { InterfaceModifiers } from '../types/type-interface';
import type { FunctionModifiers } from '../types/type-function';
import type { PropertyModifiers } from '../types/model-property';
import type { MethodModifiers } from '../types/model-method';

import { SyntaxKind } from 'typescript';
import { isTypeDeclaration } from './declaration';

export type StatementModifiers = ClassModifiers & InterfaceModifiers & FunctionModifiers & PropertyModifiers & MethodModifiers;

export const isModifierExport = (node: Node) => {
  return node.kind === SyntaxKind.ExportKeyword;
};

export const isModifierDeclare = (node: Node) => {
  return node.kind === SyntaxKind.DeclareKeyword;
};

export const isModifierAbstract = (node: Node) => {
  return node.kind === SyntaxKind.AbstractKeyword;
};

export const isModifierOverride = (node: Node) => {
  return node.kind === SyntaxKind.OverrideKeyword;
};

export const isModifierPrivate = (node: Node) => {
  return node.kind === SyntaxKind.PrivateKeyword;
};

export const isModifierProtected = (node: Node) => {
  return node.kind === SyntaxKind.ProtectedKeyword;
};

export const isModifierPublic = (node: Node) => {
  return node.kind === SyntaxKind.PublicKeyword;
};

export const isModifierAsync = (node: Node) => {
  return node.kind === SyntaxKind.AsyncKeyword;
};

export const hasModifier = (node: Node, checker: (node: Node) => boolean) => {
  if (!isTypeDeclaration(node) || !node.modifiers?.length) {
    return false;
  }

  return node.modifiers.some(checker);
};

export const hasModifierExport = (node: Node) => {
  return hasModifier(node, isModifierExport);
};

export const hasModifierDeclare = (node: Node) => {
  return hasModifier(node, isModifierDeclare);
};

export const hasModifierAbstract = (node: Node) => {
  return hasModifier(node, isModifierAbstract);
};

export const hasModifierOverride = (node: Node) => {
  return hasModifier(node, isModifierOverride);
};

export const hasModifierPrivate = (node: Node) => {
  return hasModifier(node, isModifierPrivate);
};

export const hasModifierProtected = (node: Node) => {
  return hasModifier(node, isModifierProtected);
};

export const hasModifierPublic = (node: Node) => {
  return hasModifier(node, isModifierPublic);
};

export const hasModifierAsync = (node: Node) => {
  return hasModifier(node, isModifierAsync);
};

export const getNodeModifiers = (node: Node) => {
  if (!isTypeDeclaration(node) || !node.modifiers?.length) {
    return undefined;
  }

  const modifiers: StatementModifiers = {};

  node.modifiers.forEach((modifier) => {
    if (isModifierExport(modifier)) {
      modifiers.export = true;
    } else if (isModifierDeclare(modifier)) {
      modifiers.declare = true;
    } else if (isModifierAbstract(modifier)) {
      modifiers.abstract = true;
    } else if (isModifierOverride(modifier)) {
      modifiers.override = true;
    } else if (isModifierPrivate(modifier)) {
      modifiers.private = true;
    } else if (isModifierProtected(modifier)) {
      modifiers.protected = true;
    } else if (isModifierPublic(modifier)) {
      modifiers.public = true;
    } else if (isModifierAsync(modifier)) {
      modifiers.async = true;
    }
  });

  return modifiers;
};
