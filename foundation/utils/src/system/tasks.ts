/**
 * Task execution status.
 */
export const enum TaskStatus {
  Success = 'success',
  Failure = 'failure'
}

/**
 * Task success result.
 */
export type TaskSuccess<T> = {
  status: TaskStatus.Success;
  result: T;
};

/**
 * Task failure result.
 */
export type TaskFailure = {
  status: TaskStatus.Failure;
  error: unknown;
};

export namespace Tasks {
  /**
   * Task function.
   */
  export type Task<T> = () => Promise<T>;

  /**
   * Run all the given tasks with limited concurrency.
   *
   * @param tasks Task list.
   * @param concurrency Max concurrency.
   *
   * @returns Returns the result of all tasks.
   */
  export const run = async <T>(tasks: Task<T>[], concurrency = 4) => {
    const results: T[] = Array.from({ length: tasks.length });

    let nextTask = 0;

    const workers = Array.from({ length: Math.min(tasks.length, concurrency) }, async () => {
      while (nextTask < tasks.length) {
        const currentTask = nextTask++;

        results[currentTask] = await tasks[currentTask]();
      }
    });

    await Promise.all(workers);

    return results;
  };

  /**
   * Task result;
   */
  export type Result<T> = TaskSuccess<T> | TaskFailure;

  /**
   * Run all the given tasks with limited concurrency and error handling.
   *
   * @param tasks Task list.
   * @param concurrency Max concurrency.
   *
   * @returns Returns the result of all tasks.
   */
  export const safeRun = async <T>(tasks: Task<T>[], concurrency = 4) => {
    const results: Result<T>[] = Array.from({ length: tasks.length });

    let nextTask = 0;

    const workers = Array.from({ length: Math.min(tasks.length, concurrency) }, async () => {
      while (nextTask < tasks.length) {
        const currentTask = nextTask++;

        try {
          results[currentTask] = {
            status: TaskStatus.Success,
            result: await tasks[currentTask]()
          };
        } catch (error) {
          results[currentTask] = {
            status: TaskStatus.Failure,
            error
          };
        }
      }
    });

    await Promise.all(workers);

    return results;
  };
}
