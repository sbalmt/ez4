interface InternalHeritage extends Array<any> {}

export interface Internal {
  // Regular
  regular1: Object;
  regular2: typeof Object;
  regular3: InternalHeritage;

  // Template
  template2: Set<any>;
  template3: Array<void>;
  template4: Map<never, unknown>;

  // Built-in
  required: Required<{ foo?: any; bar: null | undefined }>;
  partial: Partial<{ foo: any; bar: null }>;
}
