type Base = {
  value: string | number;
};

export interface PartialUnion {
  partial: Partial<Base>;
  original: Base;
}
