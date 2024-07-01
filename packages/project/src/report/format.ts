import { AnyObject } from '@ez4/utils';

import { toGray, toGreen, toRed } from '../console/format.js';

export const formatReportChanges = (
  changes: AnyObject,
  target: AnyObject,
  source: AnyObject,
  path?: string
) => {
  const length = getMaxPropertyLength({
    ...changes.remove,
    ...changes.update,
    ...changes.create
  });

  const createSign = toGreen(`+`);
  const removeSign = toRed(`-`);

  const output: string[] = [];

  const getOutputName = (property: string) => {
    return path ? `${path}.${property}` : property;
  };

  const getOutputValue = (property: string, value: unknown) => {
    return `${getOutputName(property).padEnd(length, ' ')} = ${toGray(formatValue(value))}`;
  };

  if (changes.remove) {
    for (const property in changes.remove) {
      output.push(`${removeSign} ${getOutputValue(property, source[property])}`);
    }
  }

  if (changes.update) {
    for (const property in changes.update) {
      output.push(`${removeSign} ${getOutputValue(property, source[property])}`);
      output.push(`${createSign} ${getOutputValue(property, target[property])}`);
    }
  }

  if (changes.create) {
    for (const property in changes.create) {
      output.push(`${createSign} ${getOutputValue(property, target[property])}`);
    }
  }

  if (changes.nested) {
    for (const property in changes.nested) {
      output.push(
        ...formatReportChanges(
          changes.nested[property],
          target[property],
          source[property],
          getOutputName(property)
        )
      );
    }
  }

  return output;
};

const getMaxPropertyLength = (object: Record<string, unknown>) => {
  let maxWidth = 0;

  for (const property in object) {
    maxWidth = Math.max(maxWidth, property.length);
  }

  return maxWidth;
};

const formatValue = (value: unknown) => {
  if (value instanceof Array) {
    return `Array(${value.length})`;
  }

  return `${value}`;
};
