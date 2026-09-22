type Base = {
  foo?: string;
  bar?: string | number | null;
  baz: boolean;
};

export interface Requireds {
  required: Required<Base>;
  original: Base;
}
