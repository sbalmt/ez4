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
 * @description Pick test object.
 */
export interface PickTestSchema {
  /**
   * @description Single selected property.
   */
  single: Pick<InnerType, 'foo'>;

  /**
   * @description Multiple selected properties.
   */
  multiple: Pick<InnerType, 'bar' | 'foo'>;

  /**
   * @description Selected partial property.
   */
  partial: Pick<Partial<InnerType>, 'foo'>;

  /**
   * @description Selected required property.
   */
  required: Required<Pick<InnerType, 'bar'>>;

  /**
   * @description Original object with all properties.
   */
  original: InnerType;
}
