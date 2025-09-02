import type { Node, TypeChecker } from 'typescript';
import type { EnumNodes } from '../resolver/type-enum';
import type { ClassNodes } from '../resolver/type-class';
import type { InterfaceNodes } from '../resolver/type-interface';
import type { PropertyNodes } from '../resolver/model-property';
import type { MethodNodes } from '../resolver/model-method';
import type { FunctionNodes } from '../resolver/type-function';

import { isImportSpecifier } from 'typescript';

import { isTypeEnum } from '../resolver/type-enum';
import { isTypeClass } from '../resolver/type-class';
import { isTypeInterface } from '../resolver/type-interface';
import { isModelProperty } from '../resolver/model-property';
import { isModelMethod } from '../resolver/model-method';
import { isTypeFunction } from '../resolver/type-function';

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
