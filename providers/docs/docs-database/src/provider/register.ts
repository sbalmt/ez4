import { tryCreateTrigger } from '@ez4/project/library';

import { generateResource } from './generator';
import { generateUsageHelp } from './help';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/docs-database', {
    'generator:createResource': generateResource,
    'generator:getUsageHelp': generateUsageHelp
  });
};
