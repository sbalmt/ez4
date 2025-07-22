import type { Node } from 'typescript';
import type { EnumNodes } from '../resolver/type-enum.js';
import type { ClassNodes } from '../resolver/type-class.js';
import type { InterfaceNodes } from '../resolver/type-interface.js';
import type { PropertyNodes } from '../resolver/model-property.js';
import type { MethodNodes } from '../resolver/model-method.js';
import type { FunctionNodes } from '../resolver/type-function.js';

import { isImportSpecifier, TypeChecker } from 'typescript';

import { isTypeEnum } from '../resolver/type-enum.js';
import { isTypeClass } from '../resolver/type-class.js';
import { isTypeInterface } from '../resolver/type-interface.js';
import { isModelProperty } from '../resolver/model-property.js';
import { isModelMethod } from '../resolver/model-method.js';
import { isTypeFunction } from '../resolver/type-function.js';

export type DeclarationNodes = EnumNodes | ClassNodes | InterfaceNodes | PropertyNodes | MethodNodes | FunctionNodes;

export const isTypeDeclaration = (node: Node): node is DeclarationNodes => {
  return (
    isTypeEnum(node) || isTypeClass(node) || isTypeInterface(node) || isModelProperty(node) || isModelMethod(node) || isTypeFunction(node)
  );
};

export const getNodeTypeDeclaration = (node: Node, checker: TypeChecker) => {
  const symbol = checker.getSymbolAtLocation(node);
  const declaration = symbol?.declarations?.at(0);

  if (declaration && isImportSpecifier(declaration)) {
    const type = checker.getTypeAtLocation(node);
    const typeSymbol = type.aliasSymbol ?? type.symbol;

    if (!typeSymbol) {
      return checker.typeToTypeNode(type, undefined, undefined);
    }

    return typeSymbol?.declarations?.at(0);
  }

  return declaration;
};
