import type { EntryState, EntryStates } from '@ez4/stateful';
import type { GatewayState } from '../main.js';
import type { StageParameters, StageState } from './types.js';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { getStageName } from './helpers/stage.js';
import { StageServiceType } from './types.js';

export const createStage = <E extends EntryState>(state: EntryStates<E>, gatewayState: GatewayState, parameters: StageParameters) => {
  const stageName = getStageName(parameters);
  const stageId = hashData(StageServiceType, gatewayState.entryId, stageName);

  return attachEntry<E | StageState, StageState>(state, {
    type: StageServiceType,
    entryId: stageId,
    dependencies: [gatewayState.entryId],
    parameters
  });
};
