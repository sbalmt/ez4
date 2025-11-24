import type { CommonOptions } from '../types/options';

import { triggerAllSync } from '@ez4/project/library';

export type GeneratorHelp = {
  arguments: string[];
  description: string;
};

export const getGeneratorsHelp = (options: CommonOptions) => {
  const generatorsHelp: GeneratorHelp[] = [];

  triggerAllSync('generator:getUsageHelp', (handler) => {
    const help = handler({ options });

    if (help) {
      generatorsHelp.push(help);
    }

    return undefined;
  });

  return generatorsHelp;
};
