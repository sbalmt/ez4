type Type<T> = T;

interface EmptyInterface {}
interface EmptyInterface2 {}

declare interface DeclareInterface {}

interface HeritageInterface extends EmptyInterface, EmptyInterface2 {}

interface BaseInterface {
  regular: any;
}

interface TemplateInterface<T> extends BaseInterface {
  regular: void;

  template: T;

  templateMethod(input: T): T;
}

interface ConcreteInterface extends TemplateInterface<never> {}

// Merged interfaces must have an export modifier to be in the reflection result.
// Otherwise only one interface will be in the reflection result when referenced.
export interface MergeInterface {
  field1: any;
}

export interface MergeInterface {
  field2: void;
}

export interface Interface {
  // Regular
  regular1: EmptyInterface;
  regular2: DeclareInterface;
  regular3: HeritageInterface;
  regular4: ConcreteInterface;
  regular5: MergeInterface;

  // Regular Method
  method1(): void;
  method2(param: any): void;
  method3(...param: any[]): void;

  // Template
  template1: Type<EmptyInterface>;
  template2: Type<HeritageInterface>;
  template3: TemplateInterface<void>;

  // Computed
  ['computed1']: any;
  [`computed2`]: void;
}
