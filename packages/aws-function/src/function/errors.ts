export class FunctionNotFoundError extends Error {
  constructor(bucketName: string) {
    super(`Function ${bucketName} wasn't found.`);
  }
}
