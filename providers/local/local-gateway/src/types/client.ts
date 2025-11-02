export type ClientRequest = {
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: string | Record<string, unknown>;
};

export type ClientResponse = {
  status: number;
  body: string;
};
