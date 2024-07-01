import { isImportSpecifier, type Node, type TypeChecker } from 'typescript';
import type { EnumNodes } from '../resolver/type-enum.js';
import type { ClassNodes } from '../resolver/type-class.js';
import type { InterfaceNodes } from '../resolver/type-interface.js';
import type { PropertyNodes } from '../resolver/model-property.js';
import type { MethodNodes } from '../resolver/model-method.js';
import type { FunctionNodes } from '../resolver/type-function.js';

import { isTypeEnum } from '../resolver/type-enum.js';
import { isTypeClass } from '../resolver/type-class.js';
import { isTypeInterface } from '../resolver/type-interface.js';
import { isModelProperty } from '../resolver/model-property.js';
import { isModelMethod } from '../resolver/model-method.js';
import { isTypeFunction } from '../resolver/type-function.js';

export type DeclarationNodes =
  | EnumNodes
  | ClassNodes
  | InterfaceNodes
  | PropertyNodes
  | MethodNodes
  | FunctionNodes;

export const isTypeDeclaration = (node: Node): node is DeclarationNodes => {
  return (
    isTypeEnum(node) ||
    isTypeClass(node) ||
    isTypeInterface(node) ||
    isModelProperty(node) ||
    isModelMethod(node) ||
    isTypeFunction(node)
  );
};

export const getNodeTypeDeclaration = (node: Node, checker: TypeChecker) => {
  const symbol = checker.getSymbolAtLocation(node);
  const symbolDeclaration = symbol?.declarations?.at(0);

  if (symbolDeclaration && isImportSpecifier(symbolDeclaration)) {
    const type = checker.getTypeAtLocation(node);
    const typeSymbol = type.symbol ?? type.aliasSymbol;
    const typeDeclaration = typeSymbol?.declarations?.at(0);

    return typeDeclaration;
  }

  return symbolDeclaration;
};
