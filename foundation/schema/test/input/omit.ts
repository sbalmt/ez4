type InnerType = {
  /**
   * @description Inner required property.
   */
  foo: number;

  /**
   * @description Inner optional property.
   */
  bar?: string;

  /**
   * @description Inner boolean property.
   */
  baz: boolean;
};

/**
 * Internal test description.
 *
 * @description Omit test object.
 */
export interface OmitTestSchema {
  /**
   * @description Single omitted property.
   */
  single: Omit<InnerType, 'foo'>;

  /**
   * @description Multiple omitted properties.
   */
  multiple: Omit<InnerType, 'bar' | 'foo'>;

  /**
   * @description Remaining partial properties.
   */
  partial: Omit<Partial<InnerType>, 'foo'>;

  /**
   * @description Remaining required properties.
   */
  required: Required<Omit<InnerType, 'foo'>>;

  /**
   * @description Original object with all properties.
   */
  original: InnerType;
}
