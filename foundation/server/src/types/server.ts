export type ServerOptions = {
  name: string;
  host?: string;
  port?: number;
};

export type ServerInstance = {
  close: () => Promise<void>;
};
