export class DuplicateMetadataError extends Error {
  constructor(public serviceName: string) {
    super(`Metadata for service ${serviceName} is duplicate.`);
  }
}
