export class InvalidBucketNameError extends Error {
  constructor(bucketName: string, maxLength: number) {
    super(`Bucket name ${bucketName} exceeds ${maxLength} characters.`);
  }
}

export class BucketNotFoundError extends Error {
  constructor(bucketName: string) {
    super(`Bucket service ${bucketName} wasn't found.`);
  }
}
