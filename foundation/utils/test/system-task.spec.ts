import { deepEqual, equal } from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { describe, it } from 'node:test';

import { Tasks, TaskStatus } from '@ez4/utils';

describe('system task utils', () => {
  const tasks = [
    () => setTimeout(1000, 'A'),
    () => setTimeout(1500, 'B'),
    () => setTimeout(1000, 'C'),
    () => setTimeout(1500, 'D'),
    () => setTimeout(1000, 'E')
  ];

  it('assert :: result order', async () => {
    const results = await Tasks.run(tasks, {
      concurrency: 4
    });

    deepEqual(results, ['A', 'B', 'C', 'D', 'E']);
  });

  it('assert :: safe result order', async () => {
    const results = await Tasks.safeRun(tasks, {
      concurrency: 4
    });

    deepEqual(results, [
      {
        status: TaskStatus.Success,
        result: 'A'
      },
      {
        status: TaskStatus.Success,
        result: 'B'
      },
      {
        status: TaskStatus.Success,
        result: 'C'
      },
      {
        status: TaskStatus.Success,
        result: 'D'
      },
      {
        status: TaskStatus.Success,
        result: 'E'
      }
    ]);
  });

  it('assert :: progress computation', async () => {
    const progress = [1, 2, 3, 4, 5];

    await Tasks.run(tasks, {
      concurrency: 4,
      onProgress: (completed, total) => {
        (equal(completed, progress.shift()), equal(total, tasks.length));
      }
    });
  });

  it('assert :: safe progress computation', async () => {
    const progress = [1, 2, 3, 4, 5];

    await Tasks.safeRun(tasks, {
      concurrency: 4,
      onProgress: (completed, total) => {
        (equal(completed, progress.shift()), equal(total, tasks.length));
      }
    });
  });
});
