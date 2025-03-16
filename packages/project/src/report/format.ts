import type { AnyObject, ObjectComparison } from '@ez4/utils';

import { toGray, toGreen, toRed } from '../console/format.js';

export const formatReportChanges = (changes: ObjectComparison, values: AnyObject, path?: string) => {
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

    return `${name.padEnd(size, ' ')} = ${toGray(formatValue(value))}`;
  };

  const createSign = toGreen(`+`);
  const removeSign = toRed(`-`);

  const output: string[] = [];

  if (changes.remove) {
    for (const property in changes.remove) {
      const oldValue = getOutputValue(property, changes.remove[property]);

      output.push(`${removeSign} ${oldValue}`);
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
