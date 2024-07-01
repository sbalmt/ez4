import type { ModelHeritage } from '../types.js';
import type { InterfaceNodes } from './type-interface.js';
import type { ClassNodes } from './type-class.js';
import type { Context, State } from './common.js';

import { tryHeritageMember } from './heritage-member.js';

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
