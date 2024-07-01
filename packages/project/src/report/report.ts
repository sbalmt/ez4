import type { AnyObject, ObjectComparison } from '@ez4/utils';
import type { EntryStates } from '@ez4/stateful';

import { StepAction } from '@ez4/stateful';
import { deepCompare } from '@ez4/utils';

import { toBold } from '../console/format.js';
import { triggerAllAsync } from '../library/triggers.js';
import { MissingEntryResourceError } from '../errors/resource.js';
import { MissingProviderError } from '../errors/provider.js';
import { formatReportChanges } from './format.js';

export const reportResourceChanges = async (newState: EntryStates, oldState: EntryStates) => {
  const event = { newState, oldState };
  const steps = await triggerAllAsync('deploy:plan', (handler) => handler(event));

  if (!steps) {
    throw new MissingProviderError(`'deploy:plan'`);
  }

  let changes = 0;

  for (const step of steps) {
    switch (step.action) {
      case StepAction.Create:
        changes += reportResourceCreate(step.entryId, newState);
        break;

      case StepAction.Update:
      case StepAction.Replace:
        changes += reportResourceUpdate(step.entryId, newState, oldState);
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

  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = {};

  const changes = deepCompare(target, source);

  return printResourceChanges(candidate.type, changes, target, source, 'will be created');
};

const reportResourceUpdate = (entryId: string, newState: EntryStates, oldState: EntryStates) => {
  const candidate = newState[entryId];
  const current = oldState[entryId];

  if (!candidate) {
    throw new MissingEntryResourceError('candidate', entryId);
  }

  if (!current) {
    throw new MissingEntryResourceError('current', entryId);
  }

  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return printResourceChanges(candidate.type, changes, target, source, 'will be updated');
};

const reportResourceDelete = (entryId: string, oldState: EntryStates) => {
  const current = oldState[entryId];

  if (!current) {
    throw new MissingEntryResourceError('current', entryId);
  }

  const target = {};
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return printResourceChanges(current.type, changes, target, source, 'will be deleted');
};

const printResourceChanges = (
  type: string,
  changes: ObjectComparison,
  target: AnyObject,
  source: AnyObject,
  action: string
) => {
  const output = formatReportChanges(changes, target, source);

  if (output.length > 0) {
    console.group(`# ${toBold(type)} ${action}`);
    console.log(output.join('\n'));

    console.groupEnd();
    console.log('');
  }

  return output.length;
};
