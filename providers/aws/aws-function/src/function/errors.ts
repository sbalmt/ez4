export class FunctionNotFoundError extends Error {
  constructor(bucketName: string) {
    super(`Function ${bucketName} wasn't found.`);
  }
}

export class DefaultVpcDetailsError extends Error {
  constructor() {
    super(`Unable to get the default VPC details.`);
  }
}
