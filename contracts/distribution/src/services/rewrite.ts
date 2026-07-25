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
   * Current path pattern which the rewrite rule is applied.
   *
   * @example
   * ```ts
   * from: '/path/*';         // Match starting with `/path/`
   * from: '/path/*.ext';     // Match starting with /path and ending with `.ext`
   * from: '/*.{ext1|ext2}';  // Match ending with `.ext1` or `.ext2`
   * from: '/!*.ext';         // Match not ending with `.ext`
   * ```
   */
  readonly from: string;

  /**
   * Result path after applying the rewrite rule.
   */
  readonly to: string;
};
