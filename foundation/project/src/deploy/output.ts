import type { EntryStates, EntryState } from '@ez4/stateful';

import { triggerAllSync } from '@ez4/project/library';
import { isNullish } from '@ez4/utils';

import { toBold } from '../utils/format';

export type ResourceOutputEvent = {
  serviceState: EntryState;
};

export type ResourceOutput = {
  value?: string | number | boolean | null;
  label: string;
};

export const getResourcesOutput = (state: EntryStates) => {
  const outputs: ResourceOutput[] = [];

  triggerAllSync('deploy:resourceOutput', (handler) => {
    for (const identifier in state) {
      const serviceState = state[identifier];

      if (serviceState) {
        const output = handler({ serviceState });

        if (output) {
          outputs.push(output);
        }
      }
    }

    return null;
  });

  return outputs;
};

export const printResourcesOutput = (state: EntryStates) => {
  const outputs = getResourcesOutput(state);

  if (outputs.length) {
    console.log(``);
  }

  for (const output of outputs) {
    if (!isNullish(output.value)) {
      console.log(`${toBold(output.label)}: ${output.value}`);
    }
  }

  if (outputs.length) {
    console.log('');
  }
};
