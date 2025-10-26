/**
 * Produces a context for the given service provider `T`.
 */
export type ServiceContext<T> = {
  [P in keyof ServiceList<T>]: ServiceList<T>[P] extends { client: infer U } ? U : never;
};

/**
 * Given a service provider `T`, it returns all its provided service clients.
 */
type ServiceList<T> = T extends { services: infer U } ? U : never;
