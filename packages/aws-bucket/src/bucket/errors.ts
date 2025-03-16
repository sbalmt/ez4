export class BucketNotFoundError extends Error {
  constructor(bucketName: string) {
    super(`Bucket service ${bucketName} wasn't found.`);
  }
}
