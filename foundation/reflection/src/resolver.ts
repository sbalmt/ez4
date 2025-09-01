import type { Node, Program } from 'typescript';
import type { TypeAnyEvents } from './types/type-any';
import type { TypeVoidEvents } from './types/type-void';
import type { TypeNeverEvents } from './types/type-never';
import type { TypeUnknownEvents } from './types/type-unknown';
import type { TypeUndefinedEvents } from './types/type-undefined';
import type { TypeNullEvents } from './types/type-null';
import type { TypeBooleanEvents } from './types/type-boolean';
import type { TypeNumberEvents } from './types/type-number';
import type { TypeStringEvents } from './types/type-string';
import type { TypeObjectEvents } from './types/type-object';
import type { TypeReferenceEvents } from './types/type-reference';
import type { SourceMap } from './types/source';
import type { AllType } from './types';

import { isExportDeclaration, isImportDeclaration } from 'typescript';
import { relative } from 'node:path';

import { getModulePath } from './utils/module';
import { isTypeLiteralString } from './resolver/type-string';
import { trySource } from './resolver/source';

export { createAny } from './resolver/type-any';
export { createVoid } from './resolver/type-void';
export { createNever } from './resolver/type-never';
export { createUnknown } from './resolver/type-unknown';
export { createUndefined } from './resolver/type-undefined';
export { createNull } from './resolver/type-null';
export { createBoolean } from './resolver/type-boolean';
export { createNumber } from './resolver/type-number';
export { createString } from './resolver/type-string';
export { createReference } from './resolver/model-reference';
export { createObject } from './resolver/type-object';
export { createUnion } from './resolver/type-union';
export { createArray } from './resolver/type-array';
export { createTuple } from './resolver/type-tuple';
export { createEnum } from './resolver/type-enum';
export { createEnumMember } from './resolver/enum-member';
export { createClass } from './resolver/type-class';
export { createInterface } from './resolver/type-interface';
export { createCallback } from './resolver/type-callback';
export { createFunction } from './resolver/type-function';

export type ResolverEvents = TypeAnyEvents &
  TypeVoidEvents &
  TypeNeverEvents &
  TypeUnknownEvents &
  TypeUndefinedEvents &
  TypeNullEvents &
  TypeNumberEvents &
  TypeStringEvents &
  TypeBooleanEvents &
  TypeObjectEvents &
  TypeReferenceEvents;

export type ResolverOptions = {
  /**
   * Determines whether or not model and function types will output its source file path.
   */
  includePath?: boolean;

  /**
   * Determines whether or not `enum` types are ignored from reflection.
   */
  ignoreEnum?: boolean;

  /**
   * Determines whether or not `class` types are ignored from reflection.
   */
  ignoreClass?: boolean;

  /**
   * Determines whether or not `interface` types are ignored from reflection.
   */
  ignoreInterface?: boolean;

  /**
   * Determines whether or not `method` types are ignored from reflection.
   */
  ignoreMethod?: boolean;

  /**
   * Determines whether or not `callback` types are ignored from reflection.
   */
  ignoreCallback?: boolean;

  /**
   * Determines whether or not `function` types are ignored from reflection.
   */
  ignoreFunction?: boolean;

  /**
   * Determines whether or not `parameter` types are ignored from reflection.
   * It has no effect when `ignoreMethod`, `ignoreCallback` or `ignoreFunction` is `true`.
   */
  ignoreParameters?: boolean;

  /**
   * Determines whether or not return types for `method`, `callback` and `function` types
   * are ignored from reflection. It has no effect when `ignoreMethod`, `ignoreCallback` or
   * `ignoreFunction` is `true`.
   */
  ignoreReturns?: boolean;
};

export type ReflectionOptions = {
  resolverOptions?: ResolverOptions;
  resolverEvents?: ResolverEvents;
};

export type ReflectionFiles = Record<string, string[]>;

export const resolveReflectionFiles = (program: Program) => {
  const basePath = program.getCurrentDirectory();
  const importGraph: ReflectionFiles = {};

  for (const sourceFile of program.getSourceFiles()) {
    const importFiles: string[] = [];

    sourceFile.forEachChild((node) => {
      if (!isImportDeclaration(node) && !isExportDeclaration(node)) {
        return;
      }

      if (!node.moduleSpecifier || !isTypeLiteralString(node.moduleSpecifier)) {
        return;
      }

      const moduleName = node.moduleSpecifier.text;
      const modulePath = getModulePath(moduleName, sourceFile.fileName);

      if (modulePath) {
        importFiles.push(relative(basePath, modulePath));
      }
    });

    if (importFiles.length > 0) {
      const importName = relative(basePath, sourceFile.fileName);

      importGraph[importName] = importFiles;
    }
  }

  const groupReflectionFiles = (fileName: string, dependencies = new Set<string>()) => {
    if (!dependencies.has(fileName)) {
      const importFiles = importGraph[fileName];

      dependencies.add(fileName);

      importFiles?.forEach((importFile) => {
        groupReflectionFiles(importFile, dependencies);
      });
    }

    return dependencies;
  };

  return program.getRootFileNames().reduce<ReflectionFiles>((imports, fileName) => {
    return {
      ...imports,
      [fileName]: [...groupReflectionFiles(fileName)]
    };
  }, {});
};

export const resolveReflectionMetadata = (program: Program, options?: ReflectionOptions) => {
  const reflection: SourceMap = {};

  const sourceContext = {
    events: options?.resolverEvents ?? {},
    options: options?.resolverOptions ?? {},
    checker: program.getTypeChecker(),
    pending: new Set<Node>(),
    cache: new WeakMap<Node, AllType>()
  };

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      const source = trySource(sourceFile, sourceContext);

      Object.assign(reflection, source);
      sourceContext.pending.clear();
    }
  }

  return reflection;
};
