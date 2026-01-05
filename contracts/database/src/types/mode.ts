/**
 * Parameters mode.
 */
export const enum ParametersMode {
  NameAndIndex = 'both',
  OnlyIndex = 'index'
}

/**
 * Transaction mode.
 */
export const enum TransactionMode {
  Interactive = 'interactive',
  Static = 'static'
}

/**
 * Insensitive mode.
 */
export const enum InsensitiveMode {
  Unsupported = 'unsupported',
  Enabled = 'enabled'
}

/**
 * Pagination mode.
 */
export const enum PaginationMode {
  Cursor = 'cursor',
  Offset = 'offset'
}

/**
 * Order mode.
 */
export const enum OrderMode {
  IndexColumns = 'index',
  AnyColumns = 'any'
}

/**
 * Lock mode.
 */
export const enum LockMode {
  Unsupported = 'unsupported',
  Supported = 'supported'
}
