import type { ProviderContext } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';

import { OptionsClient, VariablesClient } from '@ez4/common/client';

export const makeOptions = (options: AnyObject) => {
  return OptionsClient.make(options);
};

export const makeVariables = (_options?: AnyObject, context?: Pick<ProviderContext, 'variables'>) => {
  return VariablesClient.make(context?.variables);
};
