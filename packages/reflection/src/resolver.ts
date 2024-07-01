import type { Node, Program } from 'typescript';
import type { TypeAnyEvents } from './types/type-any.js';
import type { TypeVoidEvents } from './types/type-void.js';
import type { TypeNeverEvents } from './types/type-never.js';
import type { TypeUnknownEvents } from './types/type-unknown.js';
import type { TypeUndefinedEvents } from './types/type-undefined.js';
import type { TypeNullEvents } from './types/type-null.js';
import type { TypeBooleanEvents } from './types/type-boolean.js';
import type { TypeNumberEvents } from './types/type-number.js';
import type { TypeStringEvents } from './types/type-string.js';
import type { TypeObjectEvents } from './types/type-object.js';
import type { TypeReferenceEvents } from './types/type-reference.js';
import type { SourceMap } from './types/source.js';

import { trySource } from './resolver/source.js';
import { AllType } from './types.js';

export { createAny } from './resolver/type-any.js';
export { createVoid } from './resolver/type-void.js';
export { createNever } from './resolver/type-never.js';
export { createUnknown } from './resolver/type-unknown.js';
export { createUndefined } from './resolver/type-undefined.js';
export { createNull } from './resolver/type-null.js';
export { createBoolean } from './resolver/type-boolean.js';
export { createNumber } from './resolver/type-number.js';
export { createString } from './resolver/type-string.js';
export { createReference } from './resolver/model-reference.js';
export { createObject } from './resolver/type-object.js';
export { createUnion } from './resolver/type-union.js';
export { createArray } from './resolver/type-array.js';
export { createTuple } from './resolver/type-tuple.js';
export { createEnum } from './resolver/type-enum.js';
export { createEnumMember } from './resolver/enum-member.js';
export { createClass } from './resolver/type-class.js';
export { createInterface } from './resolver/type-interface.js';
export { createCallback } from './resolver/type-callback.js';
export { createFunction } from './resolver/type-function.js';

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

export const createReflection = (program: Program, options?: ReflectionOptions) => {
  const reflection: SourceMap = {};

  const sourceContext = {
    events: options?.resolverEvents ?? {},
    options: options?.resolverOptions ?? {},
    checker: program.getTypeChecker(),
    pending: new Set<Node>(),
    cache: new WeakMap<Node, AllType>()
  };

  for (const sourceFile of program.getSourceFiles()) {
    const source = trySource(sourceFile, sourceContext);

    if (source) {
      Object.assign(reflection, source);
      sourceContext.pending.clear();
    }
  }

  return reflection;
};
