interface InternalHeritage extends Array<any> {}

type AnotherType = {
  foo: any;
  bar: null;
};

export interface Internal {
  // Regular
  regular1: Object;
  regular2: typeof Object;
  regular3: InternalHeritage;

  // Template
  template2: Set<any>;
  template3: Array<void>;
  template4: Map<never, unknown>;

  // Required
  required: Required<{ foo?: any; bar: null | undefined }>;

  // Partial
  partial: Partial<AnotherType>;
}
