import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { GatewayState } from '../gateway/types';
import type { StageParameters, StageState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { getStageName } from './helpers/stage';
import { StageServiceType } from './types';

export const createStage = <E extends EntryState>(
  state: EntryStates<E>,
  gatewayState: GatewayState,
  logGroupState: LogGroupState | undefined,
  parameters: StageParameters
) => {
  const stageName = getStageName(parameters);
  const stageId = hashData(StageServiceType, gatewayState.entryId, stageName);

  const dependencies = [gatewayState.entryId];

  if (logGroupState) {
    dependencies.push(logGroupState.entryId);
  }

  return attachEntry<E | StageState, StageState>(state, {
    type: StageServiceType,
    entryId: stageId,
    dependencies,
    parameters
  });
};
