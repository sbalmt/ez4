type Type<T> = T;

enum Enum {}
class Class {}
function Function(): void {}

export interface Typeof {
  // Regular
  regular1: typeof Enum;
  regular2: typeof Class;
  regular3: typeof Function;

  // Template
  template1: Type<typeof Enum>;
  template2: Type<typeof Class>;
  template3: Type<typeof Function>;
}
