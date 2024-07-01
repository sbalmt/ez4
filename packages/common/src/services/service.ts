export namespace Service {
  export interface Provider<T> {
    client?: T;

    services?: Record<string, unknown>;
  }

  export type Context<T> = {
    [K in ServiceName<T>]: T extends Provider<unknown> ? ServiceData<T['services'][K]> : never;
  };

  type ServiceName<T> = T extends Provider<unknown> ? keyof T['services'] : never;
  type ServiceData<T> = T extends Provider<infer U> ? U : never;
}
