import type { GenerateHelpEvent } from '@ez4/project/library';

export const generateUsageHelp = (_event: GenerateHelpEvent) => {
  return {
    arguments: ['database:erd', '[ folder ]'],
    description: 'Generate an ERD for the given project'
  };
};
