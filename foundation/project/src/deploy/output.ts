import type { EntryStates, EntryState } from '@ez4/stateful';

import { triggerAllSync } from '@ez4/project/library';
import { isEmptyObject, isNullish } from '@ez4/utils';
import { LogFormat, Logger } from '@ez4/logger';

export type ResourceOutputEvent = {
  service: EntryState;
  state: EntryStates;
};

export type ResourceOutput = {
  value?: string | number | boolean | null;
  label: string;
};

export const getResourcesOutput = (state: EntryStates) => {
  const outputs: Record<string, string | number | boolean> = {};

  triggerAllSync('deploy:resourceOutput', (handler) => {
    for (const identifier in state) {
      const service = state[identifier];

      if (service) {
        const output = handler({ state, service });

        if (!isNullish(output?.value)) {
          outputs[output.label] = output.value;
        }
      }
    }

    return null;
  });

  if (isEmptyObject(outputs)) {
    return undefined;
  }

  return outputs;
};

export const reportResourcesOutput = (state: EntryStates) => {
  const outputs = getResourcesOutput(state);

  if (outputs) {
    Logger.space();

    for (const label in outputs) {
      Logger.log(`${LogFormat.toBold(label)}: ${outputs[label]}`);
    }

    Logger.space();
  }
};
