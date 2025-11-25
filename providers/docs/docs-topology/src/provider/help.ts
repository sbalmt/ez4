import type { GenerateHelpEvent } from '@ez4/project/library';

export const generateUsageHelp = (_event: GenerateHelpEvent) => {
  return {
    arguments: ['topology:graph', '[ folder ]'],
    description: 'Generate a topology graph for the given project'
  };
};
