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
 * Undefined value mode.
 */
export const enum UndefinedMode {
  Unsupported = 'unsupported',
  Supported = 'supported'
}

/**
 * Pagination mode.
 */
export const enum PaginationMode {
  Cursor = 'cursor',
  Offset = 'offset'
}

/**
 * Relation mode.
 */
export const enum RelationMode {
  Unsupported = 'unsupported',
  Supported = 'supported'
}

/**
 * Order mode.
 */
export const enum OrderMode {
  IndexColumns = 'index',
  AnyColumns = 'any'
}

/**
 * Stream mode.
 */
export const enum StreamMode {
  Unsupported = 'unsupported',
  Supported = 'supported'
}

/**
 * Lock mode.
 */
export const enum LockMode {
  Unsupported = 'unsupported',
  Supported = 'supported'
}
