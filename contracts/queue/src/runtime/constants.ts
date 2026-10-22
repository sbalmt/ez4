export namespace QueueDefaults {
  /**
   * Default handler timeout (in seconds).
   */
  export const Timeout = 150;

  /**
   * Default handler memory (in megabytes).
   */
  export const Memory = 192;

  /**
   * Default max attempts.
   */
  export const MaxAttempts = 3;

  /**
   * Default min delay (in seconds) for backoff.
   */
  export const MinBackoff = 5;

  /**
   * Default max delay (in seconds) for backoff.
   */
  export const MaxBackoff = 30;

  /**
   * Default queue delay (in seconds).
   */
  export const Delay = 0;
}
