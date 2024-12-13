type Type<T> = T;

export interface Object {
  // Regular
  regular1: {
    property1: any;
    property2: any;
    property3: any;
  };

  regular2: {
    level1: {
      level2: {
        property: any;
      };
    };
  };

  // Template
  template: Type<{ property: any }>;

  // Computed
  ['computed1']: any;
  [`computed2`]: void;

  // Dynamic
  dynamic: {
    [key: string | number]: any;
  };
}
