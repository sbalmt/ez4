import { setTimeout } from 'node:timers/promises';

/**
 * Handler to test input and output values.
 */
export const echo = (value) => ({ value });

/**
 * Handler to test worker exceptions.
 */
export const exception = () => {
  throw new TypeError('fixture handler failed');
};

/**
 * Handler to test invocation timeouts.
 */
export const timeout = () => new Promise(() => {});

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
export const isolation = async (value, delay) => {
  const count = ++invocationCount;

  await setTimeout(delay);

  return {
    count,
    value
  };
};
