export class EmulatorNotFoundError extends Error {
  constructor(resourceName: string) {
    super(`Emulator for resource ${resourceName} not found.`);
  }
}

export class EmulatorClientNotFoundError extends Error {
  constructor(resourceName: string) {
    super(`Resource ${resourceName} doesn't provide any service client.`);
  }
}
