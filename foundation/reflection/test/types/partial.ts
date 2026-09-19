type Base = {
  value: string | number;
};

export interface Partials {
  partial: Partial<Base>;
  original: Base;
}
