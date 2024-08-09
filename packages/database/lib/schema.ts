export namespace Schema {
  export type Primary<T> = {
    '@ez4/database': 'primary';
    type: T;
  };

  export type Index<T> = {
    '@ez4/database': 'regular';
    type: T;
  };
}
