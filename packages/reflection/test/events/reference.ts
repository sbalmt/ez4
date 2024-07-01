declare enum Enum {}
declare class Class {}
declare interface Interface {}

type Type<T> = T;

export interface Event {
  // Regular
  regular1: Enum;
  regular2: Class;
  regular3: Interface;

  // Template
  template: Type<any>;
}
