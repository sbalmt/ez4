import type { AnyObject, ObjectComparison } from '@ez4/utils';
import type { EntryStates } from '@ez4/stateful';

import { StepAction } from '@ez4/stateful';
import { triggerAllAsync } from '@ez4/project/library';
import { deepCompare } from '@ez4/utils';

import { toBold } from '../console/format.js';
import { MissingEntryResourceError } from '../errors/resource.js';
import { MissingProviderError } from '../errors/provider.js';
import { formatReportChanges } from './format.js';

export const reportResourceChanges = async (newState: EntryStates, oldState: EntryStates) => {
  const event = { newState, oldState };
  const steps = await triggerAllAsync('deploy:plan', (handler) => handler(event));

  if (!steps) {
    throw new MissingProviderError('deploy:plan');
  }

  let changes = 0;

  for (const step of steps) {
    switch (step.action) {
      case StepAction.Create:
        changes += reportResourceCreate(step.entryId, newState);
        break;

      case StepAction.Update:
      case StepAction.Replace:
        if (step.preview) {
          changes += reportResourceUpdate(step.entryId, step.preview, newState, oldState);
        }
        break;

      case StepAction.Delete:
        changes += reportResourceDelete(step.entryId, oldState);
        break;
    }
  }

  return changes > 0;
};

const reportResourceCreate = (entryId: string, newState: EntryStates) => {
  const candidate = newState[entryId];

  if (!candidate) {
    throw new MissingEntryResourceError('candidate', entryId);
  }

  const target = candidate.parameters;
  const changes = deepCompare(target, {});

  return printResourceChanges(candidate.type, changes, candidate, 'will be created');
};

const reportResourceUpdate = (
  entryId: string,
  comparison: ObjectComparison,
  newState: EntryStates,
  oldState: EntryStates
) => {
  const candidate = newState[entryId];
  const current = oldState[entryId];

  if (!candidate) {
    throw new MissingEntryResourceError('candidate', entryId);
  }

  if (!current) {
    throw new MissingEntryResourceError('current', entryId);
  }

  const values = {
    ...current.parameters,
    ...current.result
  };

  return printResourceChanges(candidate.type, comparison, values, 'will be updated');
};

const reportResourceDelete = (entryId: string, oldState: EntryStates) => {
  const current = oldState[entryId];

  if (!current) {
    throw new MissingEntryResourceError('current', entryId);
  }

  const changes = deepCompare({}, current.parameters);

  return printResourceChanges(current.type, changes, current, 'will be deleted');
};

const printResourceChanges = (
  type: string,
  changes: ObjectComparison,
  values: AnyObject,
  action: string
) => {
  const output = formatReportChanges(changes, values);

  if (output.length > 0) {
    const name = 'name' in changes ? changes.name : 'unnamed';

    console.group(`# ${toBold(type)} (${name}) ${action}`);
    console.log(output.join('\n'));
    console.groupEnd();

    console.log('');
  }

  return output.length;
};
