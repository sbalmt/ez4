/**
 * Naming test object.
 */
export interface NamingTestSchema {
  /**
   * Camel-case property.
   */
  fooFoo: string;

  /**
   * Pascal-case property.
   */
  FooBar: number;

  /**
   * Snake-case property.
   */
  foo_baz: boolean;

  /**
   * Kebab-case property.
   */
  'foo-qux': any;
}
