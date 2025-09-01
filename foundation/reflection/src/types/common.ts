import type { TypeParameter } from './type-parameter';
import type { EveryMemberType } from './model-members';
import type { EverySourceType } from './source';
import type { EveryType } from './types';

export type AllType = EverySourceType | EveryMemberType | EveryType | TypeParameter;

export const enum TypeName {
  Any = 'any',
  Void = 'void',
  Never = 'never',
  Unknown = 'unknown',
  Undefined = 'undefined',
  Null = 'null',
  Boolean = 'boolean',
  Number = 'number',
  String = 'string',
  Reference = 'reference',
  Object = 'object',
  Union = 'union',
  Intersection = 'intersection',
  Array = 'array',
  Tuple = 'tuple',
  Enum = 'enum',
  Class = 'class',
  Interface = 'interface',
  Property = 'property',
  Method = 'method',
  Callback = 'callback',
  Function = 'function',
  Parameter = 'parameter'
}
