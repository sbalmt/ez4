import type { AnyObject } from '@ez4/utils';

import { setTimeout } from 'node:timers/promises';

let INVOCATION_COUNT = 0;

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
export const service = ({ x, y }: AnyObject, { lazyService, mathService }: AnyObject) => {
  return {
    sum: mathService.add(x, y),
    difference: mathService.sub(x, y),
    options: lazyService.options
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
 * Handler to test worker provider events.
 */
export const event = async (_request: AnyObject, { eventService }: AnyObject) => {
  eventService.notify({
    eventMarker: 'foo'
  });
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

/**
 * Handler to test per-invocation worker isolation.
 */
export const isolation = async ({ value, delay }: AnyObject) => {
  const count = ++INVOCATION_COUNT;

  await setTimeout(delay);

  return {
    count,
    value
  };
};

/**
 * Handler to test worker logs
 */
export const logging = () => {
  console.log('worker stdout message');
  console.error('worker stderr message');
};
