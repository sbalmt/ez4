export type ClientConnection =
  | {
      database: string;
      password: string;
      user: string;
      host: string;
      port?: number;
      ssl?: boolean | object;
      connectionString?: undefined;
    }
  | {
      database: string;
      connectionString: string;
      ssl?: boolean | object;
    };
