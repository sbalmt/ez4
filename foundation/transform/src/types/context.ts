import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type TransformContextOptions = {
  /**
   * Determines the input naming style.
   */
  inputStyle?: NamingStyle;

  /**
   * Determines the output naming style.
   */
  outputStyle?: NamingStyle;

  /**
   * Determines whether the input data must be converted.
   */
  convert?: boolean;

  /**
   * Determines whether the original data must be returned in case the transformation fail.
   */
  return?: boolean;
};

export type TransformContext = TransformContextOptions & {
  /**
   * All object references in the transformation context.
   */
  references: Record<number, ObjectSchema>;
};

/**
 * Create a new transformation context based on the given transformation options.
 *
 * @param options Transformation options.
 * @returns Returns the transformation context.
 */
export const createTransformContext = (options?: TransformContextOptions): TransformContext => {
  return {
    inputStyle: options?.inputStyle,
    outputStyle: options?.outputStyle,
    convert: options?.convert ?? true,
    return: options?.return ?? true,
    references: {}
  };
};
