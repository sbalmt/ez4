import type { AnyObject } from '@ez4/utils';

import { setTimeout } from 'node:timers/promises';

/**
 * Handler to test input and output values.
 */
export const echo = ({ value }: AnyObject) => {
  return {
    value
  };
};

/**
 * Handler to test an initialized service from the worker context.
 */
export const service = ({ x, y }: AnyObject, context: AnyObject) => {
  return {
    sum: context.math.add(x, y),
    difference: context.math.sub(x, y),
    options: context.math.options
  };
};

/**
 * Handler to test request creation and preparation by the manager.
 */
export const managed = (request: AnyObject) => {
  return {
    value: request.value,
    createdByManager: request.createdByManager,
    preparedByManager: request.preparedByManager,
    managerOption: request.managerOption,
    serviceOption: request.serviceOption
  };
};

/**
 * Handler to test worker exceptions.
 */
export const exception = () => {
  throw new TypeError('Fixture handler failed');
};

/**
 * Handler to test invocation timeouts.
 */
export const timeout = () => {
  return new Promise(() => {});
};

/**
 * Handler to test memory overflow.
 */
export const memory = () => {
  const blocks = [];

  while (true) {
    blocks.push(new Array(1024 * 1024).fill(1));
  }
};

let invocationCount = 0;

/**
 * Handler to test per-invocation worker isolation.
 */
export const isolation = async ({ value, delay }: AnyObject) => {
  const count = ++invocationCount;

  await setTimeout(delay);

  return {
    count,
    value
  };
};
