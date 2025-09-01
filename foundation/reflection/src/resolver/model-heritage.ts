import type { ModelHeritage } from '../types';
import type { InterfaceNodes } from './type-interface';
import type { ClassNodes } from './type-class';
import type { Context, State } from './common';

import { tryHeritageMember } from './heritage-member';

export type NodeWithHeritage = ClassNodes | InterfaceNodes;

export const tryModelHeritage = (node: NodeWithHeritage, context: Context, state: State) => {
  const heritageList: ModelHeritage[] = [];

  node.heritageClauses?.forEach((clause) => {
    clause.types.forEach((type) => {
      const result = tryHeritageMember(type, context, state);

      if (result) {
        heritageList.push(result);
      }
    });
  });

  return heritageList;
};
