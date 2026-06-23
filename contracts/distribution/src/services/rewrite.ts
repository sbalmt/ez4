export type CdnRewriteStatus = 301 | 302;

export type CdnRewriteRule = {
  readonly from: string;
  readonly to: string;
  readonly status?: CdnRewriteStatus;
};

/**
 * @deprecated Use `CdnRewriteRule[]` instead.
 */
export type CdnRewriteMap = {
  [path: string]: string;
};

export type CdnRewrite = CdnRewriteRule[] | CdnRewriteMap;
