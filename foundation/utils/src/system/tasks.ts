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
   * Task options.
   */
  export type Options = {
    /**
     * Specify a function to be called whenever a task completes.
     */
    onProgress?: (completed: number, total: number) => void;

    /**
     * Maximum concurrent tasks.
     * Default is: `4`
     */
    concurrency?: number;
  };

  /**
   * Run all the given tasks with limited concurrency.
   *
   * @param tasks Task list.
   * @param options Task options.
   * @returns Returns the result of all tasks.
   */
  export const run = async <T>(tasks: Task<T>[], options?: Options) => {
    const results: T[] = Array.from({ length: tasks.length });

    const concurrency = options?.concurrency ?? 4;
    const onProgress = options?.onProgress;

    const totalTasks = tasks.length;

    let completedTasks = 0;
    let nextTask = 0;

    const workers = Array.from({ length: Math.min(tasks.length, concurrency) }, async () => {
      while (nextTask < totalTasks) {
        const currentTask = nextTask++;

        results[currentTask] = await tasks[currentTask]();

        onProgress?.(++completedTasks, totalTasks);
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
   * @param options Task options.
   * @returns Returns the result of all tasks.
   */
  export const safeRun = async <T>(tasks: Task<T>[], options?: Options) => {
    const results: Result<T>[] = Array.from({ length: tasks.length });

    const concurrency = options?.concurrency ?? 4;
    const onProgress = options?.onProgress;

    const totalTasks = tasks.length;

    let completedTasks = 0;
    let nextTask = 0;

    const workers = Array.from({ length: Math.min(tasks.length, concurrency) }, async () => {
      while (nextTask < totalTasks) {
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
        } finally {
          onProgress?.(++completedTasks, totalTasks);
        }
      }
    });

    await Promise.all(workers);

    return results;
  };
}
