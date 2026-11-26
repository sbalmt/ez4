import { deepEqual, equal, rejects } from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { describe, it } from 'node:test';

import { Tasks } from '@ez4/utils';

describe('task queue utils', () => {
  it('assert :: concurrency', async () => {
    const queue = new Tasks.Queue({
      concurrency: 2
    });

    let activeTasks = 0;
    let maxActiveTasks = 0;

    const tasks = Array.from({ length: 5 }, () => async () => {
      activeTasks++;

      maxActiveTasks = Math.max(maxActiveTasks, activeTasks);

      await setTimeout(1);

      activeTasks--;
    });

    await Promise.all(tasks.map((task) => queue.run(task)));

    equal(maxActiveTasks, 2);
  });

  it('assert :: failure recovery', async () => {
    const queue = new Tasks.Queue({
      concurrency: 1
    });

    await rejects(
      queue.run(async () => {
        throw new Error('Failed task');
      })
    );

    equal(await queue.run(async () => 'Next task'), 'Next task');
  });

  it('assert :: progress computation', async () => {
    const progress: [number, number][] = [];

    const queue = new Tasks.Queue({
      concurrency: 1,
      onProgress: (completed, total) => {
        progress.push([completed, total]);
      }
    });

    await queue.run(async () => 'First task');
    await queue.run(async () => 'Second task');

    deepEqual(progress, [
      [1, 1],
      [2, 2]
    ]);
  });
});
