export class GatewayNotFoundError extends Error {
  constructor(gatewayName: string) {
    super(`Gateway service ${gatewayName} wasn't found.`);
  }
}
