import type { AnyObject, ObjectComparison } from '@ez4/utils';
import type { EntryStates } from '@ez4/stateful';

import { StepAction } from '@ez4/stateful';
import { triggerAllAsync } from '@ez4/project/library';
import { deepCompare } from '@ez4/utils';

import { Color, toBold, toColor, toGreen, toRed, toYellow } from '../utils/format';
import { MissingActionProviderError } from '../errors/provider';
import { MissingEntryResourceError } from '../errors/resource';

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

    console.group(`# ${toBold(type)} ${toColor(Color.BrightBlack, `(${entryId} / ${name})`)} ${action}`);
    console.log(output.join('\n'));
    console.groupEnd();
  }

  return output.length;
};

const formatReportChanges = (changes: ObjectComparison, values: AnyObject, path?: string) => {
  const length = getMaxPropertyLength({
    ...changes.remove,
    ...changes.update,
    ...changes.create
  });

  const getOutputName = (property: string) => {
    return path ? `${path}.${property}` : property;
  };

  const getOutputValue = (property: string, value: unknown) => {
    const name = getOutputName(property);
    const size = length + (path ? path.length + 1 : 0);

    return `${name.padEnd(size, ' ')} = ${toColor(Color.BrightBlack, formatValue(value))}`;
  };

  const createSign = toGreen(`+`);
  const renameSign = toYellow(`~`);
  const removeSign = toRed(`-`);

  const output: string[] = [];

  if (changes.remove) {
    for (const property in changes.remove) {
      const oldValue = getOutputValue(property, changes.remove[property]);

      output.push(`${removeSign} ${oldValue}`);
    }
  }

  if (changes.rename) {
    for (const property in changes.rename) {
      const renameValue = getOutputValue(property, changes.rename[property]);

      output.push(`${renameSign} ${renameValue}`);
    }
  }

  if (changes.update) {
    for (const property in changes.update) {
      const newValue = getOutputValue(property, changes.update[property]);
      const oldValue = getOutputValue(property, values[property]);

      output.push(`${removeSign} ${oldValue}`);
      output.push(`${createSign} ${newValue}`);
    }
  }

  if (changes.create) {
    for (const property in changes.create) {
      const newValue = getOutputValue(property, changes.create[property]);

      output.push(`${createSign} ${newValue}`);
    }
  }

  if (changes.nested) {
    for (const property in changes.nested) {
      const newValue = changes.nested[property];
      const oldValue = values[property];

      output.push(...formatReportChanges(newValue, oldValue, getOutputName(property)));
    }
  }

  return output;
};

const getMaxPropertyLength = (object: AnyObject) => {
  let maxWidth = 0;

  for (const property in object) {
    maxWidth = Math.max(maxWidth, property.length);
  }

  return maxWidth;
};

const formatValue = (value: unknown) => {
  if (value instanceof Array) {
    return `[Array]`;
  }

  if (value instanceof Object) {
    return `[Object]`;
  }

  return `${value}`;
};
