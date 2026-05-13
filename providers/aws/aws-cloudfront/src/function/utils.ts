import type { EntryState, StepContext } from '@ez4/stateful';
import type { FunctionState } from './types';

import { FunctionServiceType } from './types';

export const isFunctionState = (resource: EntryState): resource is FunctionState => {
  return resource.type === FunctionServiceType;
};

export const tryGetFunctionArn = (context: StepContext) => {
  const resources = context.getDependencies<FunctionState>(FunctionServiceType);

  return resources[0]?.result?.functionArn;
};
