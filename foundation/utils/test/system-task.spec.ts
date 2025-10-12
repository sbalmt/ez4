import { setTimeout } from 'node:timers/promises';
import { deepEqual } from 'node:assert/strict';
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
    const results = await Tasks.run(tasks);

    deepEqual(results, ['A', 'B', 'C', 'D', 'E']);
  });

  it('assert :: safe result order', async () => {
    const results = await Tasks.safeRun(tasks);

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
});
