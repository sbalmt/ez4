import type { CommonOptions } from '../types/options';

import { triggerAllSync } from '@ez4/project/library';

export type GeneratorUsageHelp = {
  arguments: string[];
  description: string;
};

export const getGeneratorsUsageHelp = (options: CommonOptions) => {
  const generatorsHelp: GeneratorUsageHelp[] = [];

  triggerAllSync('generator:getUsageHelp', (handler) => {
    const help = handler({ options });

    if (help) {
      generatorsHelp.push(help);
    }

    return undefined;
  });

  return generatorsHelp;
};
