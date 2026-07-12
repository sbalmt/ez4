/**
 * Allowed redirect status codes.
 */
export type CdnRewriteStatus = 301 | 302;

/**
 * Rewrite rule.
 */
export type CdnRewriteRule = {
  /**
   * Optional HTTP status code for the redirect.
   */
  readonly status?: CdnRewriteStatus;

  /**
   * Current path to which the rewrite rule is applied.
   */
  readonly from: string;

  /**
   * Result path after applying the rewrite rule.
   */
  readonly to: string;
};
