type Base = {
  scalar?: string;
  value?: string | number | null;
  regular: boolean;
};

export interface RequiredUnion {
  required: Required<Base>;
  original: Base;
}
