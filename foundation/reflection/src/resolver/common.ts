import type { Node, NodeArray, TypeChecker } from 'typescript';
import type { ResolverEvents, ResolverOptions } from '../resolver.js';
import type { AllType, EveryType } from '../types.js';

export type Context = {
  events: ResolverEvents;
  options: ResolverOptions;
  checker: TypeChecker;
  pending: Set<Node>;
  cache: WeakMap<Node | NodeArray<Node>, AllType>;
};

export type TypeMap = {
  [name: string]: EveryType | null;
};

export type TypeState = {
  types: TypeMap;
};

export type ArrayState = {
  spread?: boolean;
};

export type State = TypeState & ArrayState;

export const getNewState = (partial?: Partial<State>): State => {
  return {
    types: {},
    ...partial
  };
};
