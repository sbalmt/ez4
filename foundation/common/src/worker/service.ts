import type { AnyObject } from '@ez4/utils';

import { OptionsClient, VariablesClient } from '../client';

export const makeOptions = (options: AnyObject) => {
  return OptionsClient.make(options);
};

export const makeVariables = () => {
  return VariablesClient.make();
};
