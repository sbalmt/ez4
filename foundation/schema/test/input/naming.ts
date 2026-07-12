/**
 * Internal test description.
 *
 * @description Naming test object.
 */
export interface NamingTestSchema {
  /**
   * @description Camel-case property.
   */
  fooFoo: string;

  /**
   * @description Pascal-case property.
   */
  FooBar: number;

  /**
   * @description Snake-case property.
   */
  foo_baz: boolean;

  /**
   * @description Kebab-case property.
   */
  'foo-qux': any;
}
