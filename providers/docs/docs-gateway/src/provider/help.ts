import type { GenerateHelpEvent } from '@ez4/project/library';

export const generateUsageHelp = (_event: GenerateHelpEvent) => {
  return {
    arguments: ['gateway:oas', '[ folder ]'],
    description: 'Generate an Open API Spec for the given project'
  };
};
