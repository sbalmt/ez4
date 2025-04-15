export type CdnCache = {
  compress?: boolean;
  headers?: string[];
  cookies?: string[];
  queries?: string[];
  maxTTL?: number;
  minTTL?: number;
  ttl?: number;
};
