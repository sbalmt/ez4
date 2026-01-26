export interface DynamicLogLine {
  /**
   * Last message written to the log line.
   */
  readonly message: string;

  /**
   * Update the log line.
   * @param message New message.
   */
  update: (message: string) => void;
}
