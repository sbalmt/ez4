import type { AnyObject } from '@ez4/utils';

export namespace Object {
  export type Any = {
    '@ez4/schema': 'object';
    extensible: true;
  };

  export type Default<Type extends AnyObject, Value extends Type> = {
    '@ez4/schema': 'object';
    default: Value;
    type: Type;
  };

  export type Extends<Type extends AnyObject> = {
    '@ez4/schema': 'object';
    extensible: true;
    type: Type;
  };
}
