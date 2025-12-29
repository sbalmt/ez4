export class MissingPackageError extends Error {
  constructor(message: string) {
    super(`${message}\nDid you forget to install its package?`);
  }
}
