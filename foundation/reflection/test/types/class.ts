type Type<T> = T;

class EmptyClass {}

interface EmptyInterface {}

declare class DeclareClass {}

abstract class AbstractClass {
  abstract property: any;
  abstract method(): void;
}

class HeritageClass extends AbstractClass implements EmptyInterface, Type<{ property: unknown }> {
  // @ts-expect-error
  override property: void;

  override method(): void {}
}

class BaseClass {
  regular: any;
}

class TemplateClass<T> extends BaseClass {
  // @ts-expect-error
  regular: void;

  // @ts-expect-error
  template: T;

  templateMethod(input: T): T {
    return input;
  }
}

class ConcreteClass extends TemplateClass<never> {}

export class Class {
  // Regular
  regular1!: EmptyClass;
  regular2!: DeclareClass;
  regular3!: AbstractClass;
  regular4!: HeritageClass;
  regular5!: ConcreteClass;

  // Regular method
  method1(): void {}
  method2(_param: any): void {}
  method3(..._param: any[]): void {}
  async method4(_param = null): Promise<void> {}

  // Template
  template1!: Type<EmptyClass>;
  template2!: Type<HeritageClass>;
  template3!: TemplateClass<void>;

  // Computed
  ['computed1']: any;

  // @ts-expect-error
  [`computed2`]: void;
}

export declare class ClassWithModifiers {
  // Property modifiers
  private property1: any;
  protected property2: any;
  public property3: any;

  // Method modifiers
  private method1(): void;
  protected method2(): void;
  public method3(): void;
}

export declare class ClassWithDestructingParameters {
  // @ts-expect-error: Ignore non used `param1 and `param2`.
  destructing1({ param1, param2 }: any): void {}

  // @ts-expect-error: Ignore non used `params`.
  destructing2({ param1, ...params }: any): void {}

  // @ts-expect-error: Ignore non used `_alias`.
  destructing3({ param1, param2: _alias, ...params }: any): void {}
}
