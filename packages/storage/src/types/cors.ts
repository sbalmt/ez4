export type BucketCors = {
  allowOrigins: string[];
  allowMethods?: string[];
  exposeHeaders?: string[];
  allowHeaders?: string[];
  maxAge?: number;
};
