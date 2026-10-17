export type IncomingRequest = {
  provider: string;
  request: {
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
  };
};
