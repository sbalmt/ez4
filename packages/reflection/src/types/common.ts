import type { TypeParameter } from './type-parameter.js';
import type { EveryMemberType } from './model-members.js';
import type { EverySourceType } from './source.js';
import type { EveryType } from './types.js';

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
