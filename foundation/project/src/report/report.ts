import type { AnyObject, ObjectComparison } from '@ez4/utils';
import type { EntryStates } from '@ez4/stateful';

import { StepAction } from '@ez4/stateful';
import { triggerAllAsync } from '@ez4/project/library';
import { deepCompare } from '@ez4/utils';

import { MissingEntryResourceError } from '../errors/resource';
import { MissingActionProviderError } from '../errors/provider';
import { toBold, toGray } from '../utils/format';
import { formatReportChanges } from './format';

export const reportResourceChanges = async (newState: EntryStates, oldState: EntryStates, force?: boolean) => {
  const steps = await triggerAllAsync('deploy:plan', (handler) => handler({ newState, oldState, force }));

  if (!steps) {
    throw new MissingActionProviderError('deploy:plan');
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

  if (changes > 0) {
    console.log('');

    return true;
  }

  return false;
};

const reportResourceCreate = (entryId: string, newState: EntryStates) => {
  const candidate = newState[entryId];

  if (!candidate) {
    throw new MissingEntryResourceError('candidate', entryId);
  }

  const target = candidate.parameters as AnyObject;
  const changes = deepCompare(target, {});

  return printResourceChanges(entryId, candidate.type, changes, candidate, 'will be created');
};

const reportResourceUpdate = (entryId: string, comparison: ObjectComparison, newState: EntryStates, oldState: EntryStates) => {
  const candidate = newState[entryId];
  const current = oldState[entryId];

  if (!candidate) {
    throw new MissingEntryResourceError('candidate', entryId);
  }

  if (!current) {
    throw new MissingEntryResourceError('current', entryId);
  }

  const values = {
    ...(current.parameters as AnyObject),
    ...(current.result as AnyObject),
    dependencies: current.dependencies
  };

  return printResourceChanges(entryId, candidate.type, comparison, values, 'will be updated');
};

const reportResourceDelete = (entryId: string, oldState: EntryStates) => {
  const current = oldState[entryId];

  if (!current) {
    throw new MissingEntryResourceError('current', entryId);
  }

  const changes = deepCompare({}, current.parameters as AnyObject);

  return printResourceChanges(entryId, current.type, changes, current, 'will be deleted');
};

const printResourceChanges = (entryId: string, type: string, changes: ObjectComparison, values: AnyObject, action: string) => {
  const output = formatReportChanges(changes, values);

  if (output.length > 0) {
    const name = 'name' in changes ? changes.name : 'unnamed';

    console.log('');

    console.group(`# ${toBold(type)} ${toGray(`(${entryId} / ${name})`)} ${action}`);
    console.log(output.join('\n'));
    console.groupEnd();
  }

  return output.length;
};
