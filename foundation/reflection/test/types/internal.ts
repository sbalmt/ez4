interface InternalHeritage extends Array<any> {}

type RequiredType = {
  foo: any;
  bar: null;
};

type PartialType = {
  foo?: any;
  bar?: null | undefined;
};

export interface Internal {
  // Regular
  regular1: Object;
  regular2: typeof Object;
  regular3: InternalHeritage;

  // Template
  template1: Set<any>;
  template2: Array<void>;
  template3: Map<never, unknown>;

  // Required
  required1: Required<PartialType>;
  required2: Required<PartialType | { baz?: unknown | undefined }>;

  // Partial
  partial1: Partial<RequiredType>;
  partial2: Partial<RequiredType | { baz: unknown }>;
}
