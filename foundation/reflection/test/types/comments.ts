/**
 * Enum doc comments test.
 */
export declare enum Enum {
  /**
   * Enum option.
   */
  Option = 'option'
}

/**
 * Class doc comments test.
 */
export class Class {
  /**
   * Class property.
   */
  property!: any;

  /**
   * Class method.
   * @param _param Class method parameter.
   */
  method(_param: any): void {}
}

/**
 * Interface doc comments test.
 */
export interface Interface {
  /**
   * Interface property.
   */
  property: any;

  /**
   * Interface method.
   * @param param Interface method parameter.
   */
  method(param: any): void;
}

/**
 * Function doc comments test.
 *
 * @param param Function parameter.
 */
export declare function Function(param: any): void;
