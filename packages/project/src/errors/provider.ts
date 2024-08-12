export class MissingProviderError extends Error {
  constructor(public resourceName: string) {
    super(`No providers for '${resourceName}' were found.`);
  }
}
