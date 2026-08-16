export class LogGroupNotEmptyError extends Error {
  constructor(groupName: string) {
    super(`Log group ${groupName} isn't yet empty; deletion may occur next time.`);
  }
}
