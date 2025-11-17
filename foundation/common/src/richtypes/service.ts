export namespace Service {
  /**
   * Produces a context for the given service provider `T`.
   */
  export type Context<T> = {
    [P in keyof ServiceList<T>]: ServiceEntry<T, ServiceList<T>[P]>;
  };

  /**
   * Given a service provider `T`, it returns all its provided service clients.
   */
  type ServiceList<T> = T extends { services: infer U } ? U : never;

  /**
   * Given a base service `S` and a service provider `T`, it produce a service client type.
   */
  type ServiceEntry<S, T> = T extends { reference: { client: infer U } }
    ? U
    : T extends { variables: true }
      ? S extends { variables: infer V }
        ? { [P in keyof V]: string }
        : never
      : never;
}
