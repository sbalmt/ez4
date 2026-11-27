/**
 * Default task concurrency.
 */
const DEFAULT_CONCURRENCY = 4;

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

    const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
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

  /**
   * A queue to run tasks with limited concurrency allowing to push more tasks dynamically.
   */
  export class Queue {
    /**
     * Task queue.
     */
    private readonly queue: (() => void)[] = [];

    /**
     * Count the number of completed tasks.
     */
    private completedTasks = 0;

    /**
     * Count the number of active tasks.
     */
    private activeTasks = 0;

    /**
     * Count the number of tasks.
     */
    private totalTasks = 0;

    /**
     * Construct a new tasks queue with the given options.
     *
     * @param options Task queue options.
     */
    constructor(public options?: Tasks.Options) {}

    /**
     * Schedule a new task to run. If there's available slot the task runs immediatelly, otherwise it's queued to run in the next batch.
     *
     * @param task Task function.
     * @returns Return a promise that resolves when the task is finished.
     */
    run<T>(task: Tasks.Task<T>): Promise<T> {
      const concurrency = this.options?.concurrency ?? DEFAULT_CONCURRENCY;
      const onProgress = this.options?.onProgress;

      return new Promise((resolve, reject) => {
        this.totalTasks++;

        const runTask = async (task: Tasks.Task<T>) => {
          this.activeTasks++;

          try {
            resolve(await task());
          } catch (error) {
            reject(error);
          } finally {
            this.activeTasks--;

            onProgress?.(++this.completedTasks, this.totalTasks);

            this.nextTask();
          }
        };

        if (this.activeTasks >= concurrency) {
          this.queue.push(() => runTask(task));
        } else {
          runTask(task);
        }
      });
    }

    /**
     * Run the next task from the queue.
     */
    private nextTask() {
      const concurrency = this.options?.concurrency ?? DEFAULT_CONCURRENCY;

      while (this.activeTasks < concurrency) {
        const next = this.queue.shift();

        if (!next) {
          return;
        }

        next();
      }
    }
  }
}
