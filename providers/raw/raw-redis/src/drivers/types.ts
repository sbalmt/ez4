export type CommandArgument = string | number;

/**
 * Sends raw Redis commands, both drivers share the same command semantics.
 */
export type CacheDriver = {
  send: (command: CommandArgument[]) => Promise<unknown>;
  dispose: () => void;
};

/**
 * Time limit for connecting and for each command, a cache should fail fast instead of holding
 * the caller until its own timeout.
 */
export const DRIVER_TIMEOUT = 2000;
